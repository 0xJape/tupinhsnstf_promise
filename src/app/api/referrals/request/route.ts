import { NextResponse } from "next/server";
import { z } from "zod";
import { emitMakeEvent } from "@/lib/make/emit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ContributingFactor } from "@/types/screening";

const bodySchema = z.object({
  assessmentId: z.string().uuid(),
  /** User must confirm share with care team */
  consentShare: z.literal(true),
  note: z.string().max(500).optional(),
  preferredCallAt: z.string().datetime({ local: true }).optional(),
  timeZone: z.string().min(1).max(100).optional(),
});

/**
 * POST /api/referrals/request
 * User opts in to seek care → Make sends summary to CARE_DESK_EMAIL / PHONE.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { assessmentId, note, preferredCallAt, timeZone } = parsed.data;

  if (preferredCallAt && new Date(preferredCallAt).getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "Preferred callback time must be in the future." },
      { status: 400 },
    );
  }

  const { data: row } = await supabase
    .from("risk_assessments")
    .select(
      "id, category, total_score, contributing_factors, referral_recommended, bmi_at_assessment, rule_version, created_at",
    )
    .eq("id", assessmentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  if (!row.referral_recommended) {
    return NextResponse.json(
      { error: "Referral is available for Moderate or High screening results." },
      { status: 409 },
    );
  }

  const factors = (row.contributing_factors ?? []) as ContributingFactor[];
  const callbackNote = preferredCallAt
    ? `Preferred callback: ${preferredCallAt}${timeZone ? ` (${timeZone})` : ""}.`
    : "";
  const userNote = [note?.trim(), callbackNote].filter(Boolean).join(" ") || null;

  const { data: existingCase } = await supabase
    .from("referral_cases")
    .select("id, status")
    .eq("assessment_id", row.id)
    .in("status", ["new", "contacting"])
    .maybeSingle();
  if (existingCase) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "deduped",
      caseId: existingCase.id,
      message: "Your referral request is already in the follow-up queue.",
    });
  }

  const { data: referralCase, error: caseError } = await supabase
    .from("referral_cases")
    .insert({
      user_id: user.id,
      assessment_id: row.id,
      patient_note: userNote,
      preferred_call_at: preferredCallAt || null,
      time_zone: timeZone || null,
    })
    .select("id")
    .single();
  if (caseError?.code === "23505") {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "deduped",
      message: "Your referral request is already in the follow-up queue.",
    });
  }
  if (caseError || !referralCase) {
    return NextResponse.json(
      { error: "Could not create referral case. Try again later." },
      { status: 500 },
    );
  }

  const result = await emitMakeEvent({
    userId: user.id,
    eventType: "care_referral",
    data: {
      assessmentId: row.id,
      referralCaseId: referralCase.id,
      category: row.category,
      totalScore: row.total_score,
      bmi: row.bmi_at_assessment,
      ruleVersion: row.rule_version,
      referralRecommended: row.referral_recommended,
      factors: factors.map((f) => f.label ?? f.id).slice(0, 12),
      assessedAt: row.created_at,
      userNote,
    },
    dedupeHours: 72,
  });

  if (result.skipped && result.reason === "deduped") {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "deduped",
      caseId: referralCase.id,
      message: "Care team already received this screening referral recently.",
    });
  }

  if (result.eventId) {
    await createAdminClient()
      .from("referral_cases")
      .update({ notification_event_id: result.eventId })
      .eq("id", referralCase.id)
      .eq("user_id", user.id);
  }

  if (!result.ok) {
    const status =
      result.reason === "care_desk_not_configured" ? 503 : 502;
    return NextResponse.json(
      {
        ok: false,
        reason: result.reason,
        caseId: referralCase.id,
        message:
          result.reason === "care_desk_not_configured"
            ? "Care desk contact is not configured yet."
            : "Could not send referral. Try again later.",
      },
      { status },
    );
  }

  return NextResponse.json({
    ok: true,
    caseId: referralCase.id,
    eventId: result.eventId,
    status: result.status,
    message: "Referral request submitted to the care team. They may contact you using your profile details.",
  });
}
