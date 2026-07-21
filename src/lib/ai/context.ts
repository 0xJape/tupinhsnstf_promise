import type { SupabaseClient } from "@supabase/supabase-js";

export type AiUserContext = {
  ageBand: string | null;
  bmi: number | null;
  latestCategory: string | null;
  latestScore: number | null;
  factors: string[];
  hormonalMeds: boolean | null;
  cycleSummary: string | null;
};

function ageBandFromDob(dob: string | null | undefined): string | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const years = Math.floor(
    (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  if (years < 12) return "under-12";
  if (years <= 14) return "12-14";
  if (years <= 17) return "15-17";
  if (years <= 24) return "18-24";
  return "25+";
}

/** Minimal context for Groq — no secrets, no full profile dump. */
export async function buildAiContext(
  supabase: SupabaseClient,
  userId: string,
  relatedAssessmentId?: string | null,
): Promise<AiUserContext> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("date_of_birth, bmi")
    .eq("id", userId)
    .maybeSingle();

  let assessmentQuery = supabase
    .from("risk_assessments")
    .select(
      "id, category, total_score, contributing_factors, answers, bmi_at_assessment, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (relatedAssessmentId) {
    assessmentQuery = supabase
      .from("risk_assessments")
      .select(
        "id, category, total_score, contributing_factors, answers, bmi_at_assessment, created_at",
      )
      .eq("user_id", userId)
      .eq("id", relatedAssessmentId)
      .limit(1);
  }

  const { data: assessments } = await assessmentQuery;
  const latest = assessments?.[0] ?? null;

  const factors = Array.isArray(latest?.contributing_factors)
    ? (latest.contributing_factors as { label?: string }[])
        .map((f) => f.label)
        .filter((x): x is string => Boolean(x))
        .slice(0, 8)
    : [];

  const answers = (latest?.answers ?? {}) as Record<string, unknown>;
  const hormonalMeds =
    typeof answers.hormonalMeds === "boolean"
      ? answers.hormonalMeds
      : typeof answers.Q12 === "boolean"
        ? answers.Q12
        : null;

  const { data: logs } = await supabase
    .from("menstrual_logs")
    .select("start_date, duration_days, flow")
    .eq("user_id", userId)
    .order("start_date", { ascending: false })
    .limit(6);

  let cycleSummary: string | null = null;
  if (logs && logs.length > 0) {
    const dates = logs
      .map((l) => l.start_date)
      .filter((d): d is string => Boolean(d))
      .map((d) => new Date(d).getTime())
      .filter((t) => !Number.isNaN(t))
      .sort((a, b) => b - a);
    const gaps: number[] = [];
    for (let i = 0; i < dates.length - 1; i++) {
      const days = Math.round((dates[i]! - dates[i + 1]!) / (24 * 60 * 60 * 1000));
      if (days > 0 && days < 90) gaps.push(days);
    }
    const avgGap =
      gaps.length > 0
        ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
        : null;
    cycleSummary = `${logs.length} recent period log(s)${avgGap != null ? `, ~${avgGap} days between starts` : ""}`;
  }

  return {
    ageBand: ageBandFromDob(profile?.date_of_birth),
    bmi:
      (latest?.bmi_at_assessment as number | null) ??
      (profile?.bmi as number | null) ??
      null,
    latestCategory: (latest?.category as string | null) ?? null,
    latestScore:
      typeof latest?.total_score === "number" ? latest.total_score : null,
    factors,
    hormonalMeds,
    cycleSummary,
  };
}

export function formatContextBlock(ctx: AiUserContext): string {
  const lines = [
    "User context (already computed by app rules; do not invent scores):",
    ctx.ageBand ? `- Age band: ${ctx.ageBand}` : null,
    ctx.bmi != null && ctx.bmi > 0 ? `- BMI: ${ctx.bmi}` : null,
    ctx.latestCategory
      ? `- Latest screening category: ${ctx.latestCategory}${ctx.latestScore != null ? ` (score ${ctx.latestScore})` : ""}`
      : "- No screening result on file yet",
    ctx.factors.length
      ? `- Contributing factors: ${ctx.factors.join("; ")}`
      : null,
    ctx.hormonalMeds != null
      ? `- On hormonal / cycle-affecting meds (self-report): ${ctx.hormonalMeds ? "yes" : "no"}`
      : null,
    ctx.cycleSummary ? `- Cycle logs: ${ctx.cycleSummary}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}
