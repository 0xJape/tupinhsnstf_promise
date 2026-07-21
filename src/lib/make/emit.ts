import { createAdminClient } from "@/lib/supabase/admin";
import {
  TEMPLATE_KEYS,
  type MakeChannel,
  type MakeEventType,
  type MakePayload,
} from "./types";

export type EmitResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  eventId?: string;
  status?: "queued" | "sent" | "failed";
};

type Prefs = {
  email_enabled: boolean;
  sms_enabled: boolean;
  period_reminders: boolean;
  missed_log_reminders: boolean;
  risk_followups: boolean;
  education_tips: boolean;
};

function prefAllows(eventType: MakeEventType, prefs: Prefs): boolean {
  switch (eventType) {
    case "period_reminder":
      return prefs.period_reminders;
    case "missed_tracking_reminder":
      return prefs.missed_log_reminders;
    case "elevated_risk_followup":
      return prefs.risk_followups;
    case "weekly_education":
      return prefs.education_tips;
    case "care_referral":
      return true;
  }
}

function resolveUserChannels(
  prefs: Prefs,
  email: string | null,
  mobile: string | null,
): ("email" | "sms")[] {
  const out: ("email" | "sms")[] = [];
  if (prefs.email_enabled && email) out.push("email");
  if (prefs.sms_enabled && mobile) out.push("sms");
  return out;
}

/** Care desk from env — who receives referral packets. */
export function getCareDeskContacts(): {
  email: string | null;
  mobile: string | null;
  channels: ("email" | "sms")[];
} {
  const email = process.env.CARE_DESK_EMAIL?.trim() || null;
  const mobile = process.env.CARE_DESK_PHONE?.trim() || null;
  const channels: ("email" | "sms")[] = [];
  if (email) channels.push("email");
  if (mobile) channels.push("sms");
  return { email, mobile, channels };
}

function toChannel(channels: ("email" | "sms")[]): MakeChannel {
  if (channels.includes("email") && channels.includes("sms")) return "both";
  if (channels.includes("sms")) return "sms";
  return "email";
}

function firstName(fullName: string | null | undefined): string {
  const t = fullName?.trim();
  if (!t) return "there";
  return t.split(/\s+/)[0] ?? "there";
}

/**
 * Emit via Make.com + audit.
 * care_referral → CARE_DESK_EMAIL / CARE_DESK_PHONE; patient in data.patient.
 */
export async function emitMakeEvent(opts: {
  userId: string;
  eventType: MakeEventType;
  data?: Record<string, unknown>;
  dedupeHours?: number;
}): Promise<EmitResult> {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL?.trim();
  const secret = process.env.MAKE_WEBHOOK_SECRET?.trim();
  const admin = createAdminClient();
  const dedupeHours = opts.dedupeHours ?? 20;
  const isCareReferral = opts.eventType === "care_referral";

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email, mobile_number, date_of_birth")
    .eq("id", opts.userId)
    .maybeSingle();

  if (!profile) {
    return { ok: false, reason: "profile_missing" };
  }

  const { data: prefsRow } = await admin
    .from("notification_preferences")
    .select(
      "email_enabled, sms_enabled, period_reminders, missed_log_reminders, risk_followups, education_tips",
    )
    .eq("user_id", opts.userId)
    .maybeSingle();

  const prefs: Prefs = prefsRow ?? {
    email_enabled: true,
    sms_enabled: false,
    period_reminders: true,
    missed_log_reminders: true,
    risk_followups: true,
    education_tips: false,
  };

  if (!prefAllows(opts.eventType, prefs)) {
    return { ok: true, skipped: true, reason: "pref_off" };
  }

  const patientEmail = profile.email?.trim() || null;
  const patientMobile = profile.mobile_number?.trim() || null;

  let deliverEmail: string | null;
  let deliverMobile: string | null;
  let channels: ("email" | "sms")[];

  if (isCareReferral) {
    const desk = getCareDeskContacts();
    if (!desk.channels.length) {
      return { ok: false, reason: "care_desk_not_configured" };
    }
    deliverEmail = desk.email;
    deliverMobile = desk.mobile;
    channels = desk.channels;
  } else {
    deliverEmail = patientEmail;
    deliverMobile = patientMobile;
    channels = resolveUserChannels(prefs, patientEmail, patientMobile);
    if (!channels.length) {
      return { ok: true, skipped: true, reason: "no_channel" };
    }
  }

  if (dedupeHours > 0) {
    const since = new Date(
      Date.now() - dedupeHours * 60 * 60 * 1000,
    ).toISOString();
    const { data: recent } = await admin
      .from("notification_events")
      .select("id, payload")
      .eq("user_id", opts.userId)
      .eq("event_type", opts.eventType)
      .in("status", ["queued", "sent"])
      .gte("created_at", since)
      .limit(20);

    if (recent?.length) {
      if (!isCareReferral) {
        return { ok: true, skipped: true, reason: "deduped" };
      }
      const assessmentId = opts.data?.assessmentId;
      if (typeof assessmentId === "string") {
        const same = recent.some((r) => {
          const p = r.payload as { data?: { assessmentId?: string } } | null;
          return p?.data?.assessmentId === assessmentId;
        });
        if (same) {
          return { ok: true, skipped: true, reason: "deduped" };
        }
      } else {
        return { ok: true, skipped: true, reason: "deduped" };
      }
    }
  }

  const templateKey = TEMPLATE_KEYS[opts.eventType];
  const baseData: Record<string, unknown> = {
    firstName: firstName(profile.full_name),
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    ...opts.data,
  };

  if (isCareReferral) {
    baseData.patient = {
      userId: opts.userId,
      fullName: profile.full_name,
      email: patientEmail,
      mobile: patientMobile,
      dateOfBirth: profile.date_of_birth ?? null,
    };
    baseData.careDesk = {
      email: deliverEmail,
      mobile: deliverMobile,
    };
  }

  const { data: eventRow, error: insertErr } = await admin
    .from("notification_events")
    .insert({
      user_id: opts.userId,
      event_type: opts.eventType,
      payload: {
        templateKey,
        channels,
        data: baseData,
        recipient: isCareReferral ? "care_desk" : "user",
      },
      channel: toChannel(channels),
      status: "queued",
    })
    .select("id")
    .single();

  if (insertErr || !eventRow) {
    console.error("notification_events insert", insertErr?.message);
    return { ok: false, reason: insertErr?.message ?? "insert_failed" };
  }

  const payload: MakePayload = {
    eventType: opts.eventType,
    userId: opts.userId,
    email: deliverEmail,
    mobile: deliverMobile,
    channels,
    templateKey,
    data: baseData,
    timestamp: new Date().toISOString(),
    eventId: eventRow.id,
  };

  if (!webhookUrl) {
    await admin
      .from("notification_events")
      .update({
        status: "failed",
        provider_ref: "no_MAKE_WEBHOOK_URL",
        payload: { ...payload, note: "Webhook URL not configured" },
      })
      .eq("id", eventRow.id);
    return {
      ok: false,
      eventId: eventRow.id,
      status: "failed",
      reason: "no_webhook",
    };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-make-secret": secret } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Make webhook", res.status, body.slice(0, 200));
      await admin
        .from("notification_events")
        .update({
          status: "failed",
          provider_ref: `http_${res.status}`,
          payload,
        })
        .eq("id", eventRow.id);
      return {
        ok: false,
        eventId: eventRow.id,
        status: "failed",
        reason: `http_${res.status}`,
      };
    }

    await admin
      .from("notification_events")
      .update({
        status: "sent",
        provider_ref: "make",
        payload,
      })
      .eq("id", eventRow.id);

    return {
      ok: true,
      eventId: eventRow.id,
      status: "sent",
    };
  } catch (e) {
    console.error("Make webhook failed", e);
    await admin
      .from("notification_events")
      .update({
        status: "failed",
        provider_ref: "network_error",
        payload,
      })
      .eq("id", eventRow.id);
    return {
      ok: false,
      eventId: eventRow.id,
      status: "failed",
      reason: "network_error",
    };
  }
}
