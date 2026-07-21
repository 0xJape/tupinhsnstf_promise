/** PCOS screening types — rule version pcos-screen-v2 (Peña 2025 adolescent-aligned). */

export type RiskCategory = "Low" | "Moderate" | "High";

/** Boolean / meta quiz keys (menarcheAgeYears is separate number). */
export type BooleanQuestionId =
  | "cycleIrregular"
  | "gap90"
  | "skippedMonths"
  | "hirsutism"
  | "acnePersistent"
  | "scalpThinning"
  | "elevatedTestosterone"
  | "weightHard"
  | "rapidWeightGain"
  | "acanthosis"
  | "skinTags"
  | "metabolicHistory"
  | "familyPcos"
  | "familyDiabetes"
  | "lowActivity"
  | "shortSleep"
  | "unhealthyDiet"
  | "hormonalMeds"
  | "ultrasoundPcom"
  | "amhTested"
  | "moodConcern";

/** @deprecated v1 ids — kept only for reading old snapshots in UI if needed */
export type LegacyQuestionId =
  | "Q1"
  | "Q2"
  | "Q3"
  | "Q4"
  | "Q5"
  | "Q6"
  | "Q7"
  | "Q8"
  | "Q9"
  | "Q10"
  | "Q11"
  | "Q12";

/** @deprecated use BooleanQuestionId — alias for gradual migration */
export type QuestionId = BooleanQuestionId;

export type ScreeningAnswers = {
  /** Age at first period (years). Context for gynecologic age. */
  menarcheAgeYears: number;
  cycleIrregular: boolean;
  gap90: boolean;
  skippedMonths: boolean;
  hirsutism: boolean;
  acnePersistent: boolean;
  scalpThinning: boolean;
  /** True only if told testosterone/FAI high; false if no/never tested. */
  elevatedTestosterone: boolean;
  weightHard: boolean;
  rapidWeightGain: boolean;
  acanthosis: boolean;
  skinTags: boolean;
  metabolicHistory: boolean;
  familyPcos: boolean;
  familyDiabetes: boolean;
  lowActivity: boolean;
  shortSleep: boolean;
  unhealthyDiet: boolean;
  /** Meta — 0 points; cycle interpretation. */
  hormonalMeds: boolean;
  /** Collected for education only — never scored (adolescent PCOM). */
  ultrasoundPcom: boolean;
  /** Collected for education only — never scored. */
  amhTested: boolean;
  /** Mental-health flag only — 0 PCOS points. */
  moodConcern: boolean;
};

export type DomainScores = {
  menstrual: number;
  hyperandrogenism: number;
  family: number;
  insulin: number;
  bmi: number;
  lifestyle: number;
};

export type ContributingFactor = {
  id: string;
  label: string;
  points: number;
  domain?: keyof DomainScores;
};

export type ScreeningResult = {
  ruleVersion: "pcos-screen-v2";
  totalScore: number;
  category: RiskCategory;
  domains: DomainScores;
  gynecologicAgeYears: number | null;
  majorMenstrual: boolean;
  majorHyperandrogenism: boolean;
  contributingFactors: ContributingFactor[];
  referralRecommended: boolean;
  bmi: number;
  hormonalMeds: boolean;
  mentalHealthFlag: boolean;
  excludedImagingNote: boolean;
};
