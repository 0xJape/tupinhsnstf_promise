import { NextResponse } from "next/server";
import { z } from "zod";
import { emitMakeEvent } from "@/lib/make/emit";
import { createClient } from "@/lib/supabase/server";
import type { ContributingFactor } from "@/types/screening";

const bodySchema = z.object({
  assessmentId: z.string().uuid(),
  /** User must confirm share with care team */
  consentShare: z.literal(true),
  note: z.string().max(500).optional(),
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

  const { assessmentId, note } = parsed.data;

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

  const factors = (row.contributing_factors ?? []) as ContributingFactor[];

  const result = await emitMakeEvent({
    userId: user.id,
    eventType: "care_referral",
    data: {
      assessmentId: row.id,
      category: row.category,
      totalScore: row.total_score,
      bmi: row.bmi_at_assessment,
      ruleVersion: row.rule_version,
      referralRecommended: row.referral_recommended,
      factors: factors.map((f) => f.label ?? f.id).slice(0, 12),
      assessedAt: row.created_at,
      userNote: note?.trim() || null,
    },
    dedupeHours: 72,
  });

  if (result.skipped && result.reason === "deduped") {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "deduped",
      message: "Care team already received this screening referral recently.",
    });
  }

  if (!result.ok) {
    const status =
      result.reason === "care_desk_not_configured" ? 503 : 502;
    return NextResponse.json(
      {
        ok: false,
        reason: result.reason,
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
    eventId: result.eventId,
    status: result.status,
    message: "Referral sent to the care team. They may contact you using your profile details.",
  });
}
