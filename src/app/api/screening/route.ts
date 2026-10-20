import { NextResponse } from "next/server";
import { z } from "zod";
import { BOOLEAN_QUESTION_IDS, scoreAssessment } from "@/lib/rules/pcosScreen";
import { createClient } from "@/lib/supabase/server";
import type { ScreeningAnswers } from "@/types/screening";

const bodySchema = z.object({
  answers: z.object({
    menarcheAgeYears: z.number().min(8).max(18),
    cycleIrregular: z.boolean(),
    gap90: z.boolean(),
    skippedMonths: z.boolean(),
    hirsutism: z.boolean(),
    acnePersistent: z.boolean(),
    scalpThinning: z.boolean(),
    elevatedTestosterone: z.boolean(),
    weightHard: z.boolean(),
    rapidWeightGain: z.boolean(),
    acanthosis: z.boolean(),
    skinTags: z.boolean(),
    metabolicHistory: z.boolean(),
    familyPcos: z.boolean(),
    familyDiabetes: z.boolean(),
    lowActivity: z.boolean(),
    shortSleep: z.boolean(),
    unhealthyDiet: z.boolean(),
    hormonalMeds: z.boolean(),
    ultrasoundPcom: z.boolean(),
    amhTested: z.boolean(),
    moodConcern: z.boolean(),
  }),
});

function ageYearsFromDob(dob: string | null | undefined): number | undefined {
  if (!dob) return undefined;
  const birth = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age > 0 ? age : undefined;
}

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

  const { data: existingBaseline } = await supabase
    .from("risk_assessments")
    .select("id")
    .eq("user_id", user.id)
    .eq("assessment_type", "baseline")
    .eq("record_status", "valid")
    .maybeSingle();

  if (existingBaseline) {
    return NextResponse.json(
      {
        error: "Your baseline screening is already complete.",
        existingBaselineId: existingBaseline.id,
      },
      { status: 409 },
    );
  }

  const answers = parsed.data.answers as ScreeningAnswers;
  for (const id of BOOLEAN_QUESTION_IDS) {
    if (typeof answers[id] !== "boolean") {
      return NextResponse.json(
        { error: `Missing answer for ${id}` },
        { status: 400 },
      );
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("height_cm, weight_kg, bmi, date_of_birth")
    .eq("id", user.id)
    .maybeSingle();
  const heightCm = profile?.height_cm ?? undefined;
  const weightKg = profile?.weight_kg ?? undefined;
  const bmi = profile?.bmi ?? undefined;
  const ageYears = ageYearsFromDob(profile?.date_of_birth);

  const result = scoreAssessment({
    answers,
    heightCm,
    weightKg,
    bmi,
    ageYears,
  });

  const item_points = Object.fromEntries(
    result.contributingFactors.map((f) => [f.id, f.points]),
  );

  const { data: row, error } = await supabase
    .from("risk_assessments")
    .insert({
      user_id: user.id,
      rule_version: result.ruleVersion,
      answers,
      bmi_at_assessment: result.bmi > 0 ? result.bmi : null,
      item_points,
      total_score: result.totalScore,
      category: result.category,
      contributing_factors: result.contributingFactors,
      referral_recommended: result.referralRecommended,
      assessment_type: "baseline",
      record_status: "valid",
      source: "participant",
    })
    .select("id")
    .single();

  if (error?.code === "23505") {
    const { data: baseline } = await supabase
      .from("risk_assessments")
      .select("id")
      .eq("user_id", user.id)
      .eq("assessment_type", "baseline")
      .eq("record_status", "valid")
      .maybeSingle();
    return NextResponse.json(
      {
        error: "Your baseline screening is already complete.",
        existingBaselineId: baseline?.id,
      },
      { status: 409 },
    );
  }

  if (error || !row) {
    return NextResponse.json(
      { error: error?.message ?? "Could not save assessment" },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: row.id, result });
}