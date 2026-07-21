import { NextResponse } from "next/server";
import { z } from "zod";
import { emitMakeEvent } from "@/lib/make/emit";
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
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  bmi: z.number().nonnegative().optional(),
  ageYears: z.number().positive().max(120).optional(),
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

  const answers = parsed.data.answers as ScreeningAnswers;
  for (const id of BOOLEAN_QUESTION_IDS) {
    if (typeof answers[id] !== "boolean") {
      return NextResponse.json(
        { error: `Missing answer for ${id}` },
        { status: 400 },
      );
    }
  }

  let heightCm = parsed.data.heightCm;
  let weightKg = parsed.data.weightKg;
  let bmi = parsed.data.bmi;
  let ageYears = parsed.data.ageYears;

  if (
    heightCm == null ||
    weightKg == null ||
    bmi == null ||
    ageYears == null
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("height_cm, weight_kg, bmi, date_of_birth")
      .eq("id", user.id)
      .maybeSingle();
    heightCm ??= profile?.height_cm ?? undefined;
    weightKg ??= profile?.weight_kg ?? undefined;
    bmi ??= profile?.bmi ?? undefined;
    ageYears ??= ageYearsFromDob(profile?.date_of_birth);
  }

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
    })
    .select("id")
    .single();

  if (error || !row) {
    return NextResponse.json(
      { error: error?.message ?? "Could not save assessment" },
      { status: 500 },
    );
  }

  if (result.referralRecommended) {
    void emitMakeEvent({
      userId: user.id,
      eventType: "elevated_risk_followup",
      data: {
        assessmentId: row.id,
        category: result.category,
        totalScore: result.totalScore,
        factors: result.contributingFactors
          .map((f) => f.label ?? f.id)
          .slice(0, 8),
      },
      dedupeHours: 48,
    }).catch((e) => console.error("elevated_risk emit", e));
  }

  return NextResponse.json({ id: row.id, result });
}