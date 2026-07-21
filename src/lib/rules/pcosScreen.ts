import type {
  BooleanQuestionId,
  ContributingFactor,
  DomainScores,
  RiskCategory,
  ScreeningAnswers,
  ScreeningResult,
} from "@/types/screening";

export const RULE_VERSION = "pcos-screen-v2" as const;

/** Domain caps (Peña-aligned educational screen). */
export const DOMAIN_MAX = {
  menstrual: 30,
  hyperandrogenism: 30,
  family: 15,
  insulin: 10,
  bmi: 10,
  lifestyle: 5,
} as const;

export const MAX_SCREEN_SCORE = 100;

export const BOOLEAN_QUESTION_IDS: BooleanQuestionId[] = [
  "cycleIrregular",
  "gap90",
  "skippedMonths",
  "hirsutism",
  "acnePersistent",
  "scalpThinning",
  "elevatedTestosterone",
  "weightHard",
  "rapidWeightGain",
  "acanthosis",
  "skinTags",
  "metabolicHistory",
  "familyPcos",
  "familyDiabetes",
  "lowActivity",
  "shortSleep",
  "unhealthyDiet",
  "hormonalMeds",
  "ultrasoundPcom",
  "amhTested",
  "moodConcern",
];

export const QUESTION_LABELS: Record<
  BooleanQuestionId | "menarcheAgeYears",
  string
> = {
  menarcheAgeYears: "Age at first period",
  cycleIrregular: "Irregular cycles (age-aware)",
  gap90: "Gap >90 days without a period",
  skippedMonths: "Skipped periods for several months",
  hirsutism: "Unwanted hair (hirsutism areas)",
  acnePersistent: "Persistent hard-to-treat acne",
  scalpThinning: "Scalp hair thinning",
  elevatedTestosterone: "Told testosterone is high",
  weightHard: "Hard to lose weight / weight concern",
  rapidWeightGain: "Rapid weight gain",
  acanthosis: "Dark skin patches (acanthosis)",
  skinTags: "Skin tags",
  metabolicHistory: "Prior metabolic diagnoses",
  familyPcos: "Mother or sister with PCOS",
  familyDiabetes: "Family type 2 diabetes",
  lowActivity: "Low physical activity",
  shortSleep: "Short sleep",
  unhealthyDiet: "Unhealthy / high-sugar diet pattern",
  hormonalMeds: "Hormonal contraception / cycle meds",
  ultrasoundPcom: "Pelvic ultrasound / polycystic ovaries (not scored)",
  amhTested: "AMH testing (not scored)",
  moodConcern: "Mood / anxiety concern (not scored)",
};

export type ScoreInput = {
  answers: ScreeningAnswers;
  /** Age in whole years (from DOB). Required for gynecologic age. */
  ageYears?: number;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
};

export function computeBmi(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function gynecologicAgeYears(
  ageYears: number | undefined,
  menarcheAgeYears: number,
): number | null {
  if (ageYears == null || !Number.isFinite(ageYears)) return null;
  if (!Number.isFinite(menarcheAgeYears) || menarcheAgeYears <= 0) return null;
  return Math.max(0, Math.round((ageYears - menarcheAgeYears) * 10) / 10);
}

function clamp(n: number, max: number): number {
  return Math.min(max, Math.max(0, n));
}

/**
 * Risk from domain majors (guideline §3.3) with gray-zone fallback.
 * High = both majors ≥20. Moderate = exactly one major ≥20 (other <15),
 * or gray elevated pattern. Low = weak majors + low total.
 */
export function categoryFromDomains(
  domains: DomainScores,
  totalScore: number,
): RiskCategory {
  const m = domains.menstrual;
  const h = domains.hyperandrogenism;
  const majorM = m >= 20;
  const majorH = h >= 20;

  if (majorM && majorH) return "High";
  if ((majorM && h < 15) || (majorH && m < 15)) return "Moderate";
  if (totalScore < 30 && m < 15 && h < 15) return "Low";
  if (majorM || majorH || m >= 15 || h >= 15 || totalScore >= 40) {
    return "Moderate";
  }
  return "Low";
}

/** @deprecated use categoryFromDomains */
export function categoryFromScore(totalScore: number): RiskCategory {
  if (totalScore >= 60) return "High";
  if (totalScore >= 30) return "Moderate";
  return "Low";
}

function scoreMenstrual(
  a: ScreeningAnswers,
  gyn: number | null,
): { points: number; factors: ContributingFactor[] } {
  const factors: ContributingFactor[] = [];
  let pts = 0;
  const g = gyn ?? 3;

  if (a.gap90 && g >= 1) {
    pts += 10;
    factors.push({
      id: "gap90",
      label: QUESTION_LABELS.gap90,
      points: 10,
      domain: "menstrual",
    });
  }

  if (a.skippedMonths) {
    const add = g >= 3 ? 12 : g >= 1 ? 6 : 3;
    pts += add;
    factors.push({
      id: "skippedMonths",
      label: QUESTION_LABELS.skippedMonths,
      points: add,
      domain: "menstrual",
    });
  }

  if (a.cycleIrregular) {
    const add = g < 1 ? 5 : g < 3 ? 15 : 22;
    pts += add;
    factors.push({
      id: "cycleIrregular",
      label:
        g < 1
          ? "Irregular cycles (early post-menarche — lower weight)"
          : QUESTION_LABELS.cycleIrregular,
      points: add,
      domain: "menstrual",
    });
  }

  return { points: clamp(pts, DOMAIN_MAX.menstrual), factors };
}

function scoreHyperandrogenism(
  a: ScreeningAnswers,
): { points: number; factors: ContributingFactor[] } {
  const factors: ContributingFactor[] = [];
  let pts = 0;

  if (a.elevatedTestosterone) {
    pts += 25;
    factors.push({
      id: "elevatedTestosterone",
      label: QUESTION_LABELS.elevatedTestosterone,
      points: 25,
      domain: "hyperandrogenism",
    });
  }
  if (a.hirsutism) {
    pts += 18;
    factors.push({
      id: "hirsutism",
      label: QUESTION_LABELS.hirsutism,
      points: 18,
      domain: "hyperandrogenism",
    });
  }
  if (a.acnePersistent) {
    pts += 12;
    factors.push({
      id: "acnePersistent",
      label: QUESTION_LABELS.acnePersistent,
      points: 12,
      domain: "hyperandrogenism",
    });
  }
  if (a.scalpThinning) {
    pts += 7;
    factors.push({
      id: "scalpThinning",
      label: QUESTION_LABELS.scalpThinning,
      points: 7,
      domain: "hyperandrogenism",
    });
  }

  return { points: clamp(pts, DOMAIN_MAX.hyperandrogenism), factors };
}

function scoreFamily(
  a: ScreeningAnswers,
): { points: number; factors: ContributingFactor[] } {
  const factors: ContributingFactor[] = [];
  let pts = 0;
  if (a.familyPcos) {
    pts += 10;
    factors.push({
      id: "familyPcos",
      label: QUESTION_LABELS.familyPcos,
      points: 10,
      domain: "family",
    });
  }
  if (a.familyDiabetes) {
    pts += 5;
    factors.push({
      id: "familyDiabetes",
      label: QUESTION_LABELS.familyDiabetes,
      points: 5,
      domain: "family",
    });
  }
  return { points: clamp(pts, DOMAIN_MAX.family), factors };
}

function scoreInsulin(
  a: ScreeningAnswers,
): { points: number; factors: ContributingFactor[] } {
  const factors: ContributingFactor[] = [];
  let pts = 0;
  if (a.acanthosis) {
    pts += 6;
    factors.push({
      id: "acanthosis",
      label: QUESTION_LABELS.acanthosis,
      points: 6,
      domain: "insulin",
    });
  }
  if (a.skinTags) {
    pts += 3;
    factors.push({
      id: "skinTags",
      label: QUESTION_LABELS.skinTags,
      points: 3,
      domain: "insulin",
    });
  }
  if (a.metabolicHistory) {
    pts += 5;
    factors.push({
      id: "metabolicHistory",
      label: QUESTION_LABELS.metabolicHistory,
      points: 5,
      domain: "insulin",
    });
  }
  return { points: clamp(pts, DOMAIN_MAX.insulin), factors };
}

function scoreBmiDomain(
  a: ScreeningAnswers,
  bmi: number,
): { points: number; factors: ContributingFactor[] } {
  const factors: ContributingFactor[] = [];
  let pts = 0;
  if (bmi >= 23) {
    pts += 4;
    factors.push({
      id: "bmi23",
      label: "BMI ≥ 23 (Asia-Pacific metabolic flag)",
      points: 4,
      domain: "bmi",
    });
  }
  if (bmi >= 30) {
    pts += 3;
    factors.push({
      id: "bmi30",
      label: "BMI ≥ 30",
      points: 3,
      domain: "bmi",
    });
  }
  if (a.weightHard) {
    pts += 3;
    factors.push({
      id: "weightHard",
      label: QUESTION_LABELS.weightHard,
      points: 3,
      domain: "bmi",
    });
  }
  if (a.rapidWeightGain) {
    pts += 5;
    factors.push({
      id: "rapidWeightGain",
      label: QUESTION_LABELS.rapidWeightGain,
      points: 5,
      domain: "bmi",
    });
  }
  return { points: clamp(pts, DOMAIN_MAX.bmi), factors };
}

function scoreLifestyle(
  a: ScreeningAnswers,
): { points: number; factors: ContributingFactor[] } {
  const factors: ContributingFactor[] = [];
  let pts = 0;
  if (a.lowActivity) {
    pts += 2;
    factors.push({
      id: "lowActivity",
      label: QUESTION_LABELS.lowActivity,
      points: 2,
      domain: "lifestyle",
    });
  }
  if (a.shortSleep) {
    pts += 1;
    factors.push({
      id: "shortSleep",
      label: QUESTION_LABELS.shortSleep,
      points: 1,
      domain: "lifestyle",
    });
  }
  if (a.unhealthyDiet) {
    pts += 2;
    factors.push({
      id: "unhealthyDiet",
      label: QUESTION_LABELS.unhealthyDiet,
      points: 2,
      domain: "lifestyle",
    });
  }
  return { points: clamp(pts, DOMAIN_MAX.lifestyle), factors };
}

/**
 * Pure rule engine — server-side only.
 * Screening / risk estimation, not diagnosis (Peña et al. 2025).
 */
export function scoreAssessment(input: ScoreInput): ScreeningResult {
  const a = input.answers;
  const bmi =
    input.bmi ??
    (input.heightCm != null && input.weightKg != null
      ? computeBmi(input.heightCm, input.weightKg)
      : 0);

  const gyn = gynecologicAgeYears(input.ageYears, a.menarcheAgeYears);

  const menstrual = scoreMenstrual(a, gyn);
  const ha = scoreHyperandrogenism(a);
  const family = scoreFamily(a);
  const insulin = scoreInsulin(a);
  const bmiDom = scoreBmiDomain(a, bmi);
  const lifestyle = scoreLifestyle(a);

  const domains: DomainScores = {
    menstrual: menstrual.points,
    hyperandrogenism: ha.points,
    family: family.points,
    insulin: insulin.points,
    bmi: bmiDom.points,
    lifestyle: lifestyle.points,
  };

  const totalScore =
    domains.menstrual +
    domains.hyperandrogenism +
    domains.family +
    domains.insulin +
    domains.bmi +
    domains.lifestyle;

  const factors = [
    ...menstrual.factors,
    ...ha.factors,
    ...family.factors,
    ...insulin.factors,
    ...bmiDom.factors,
    ...lifestyle.factors,
  ].sort((x, y) => y.points - x.points || x.id.localeCompare(y.id));

  const category = categoryFromDomains(domains, totalScore);
  const majorMenstrual = domains.menstrual >= 20;
  const majorHyperandrogenism = domains.hyperandrogenism >= 20;

  return {
    ruleVersion: RULE_VERSION,
    totalScore,
    category,
    domains,
    gynecologicAgeYears: gyn,
    majorMenstrual,
    majorHyperandrogenism,
    contributingFactors: factors,
    referralRecommended: category === "Moderate" || category === "High",
    bmi,
    hormonalMeds: Boolean(a.hormonalMeds),
    mentalHealthFlag: Boolean(a.moodConcern),
    excludedImagingNote: Boolean(a.ultrasoundPcom || a.amhTested),
  };
}