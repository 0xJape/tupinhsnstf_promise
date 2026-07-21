import type { BooleanQuestionId, RiskCategory } from "@/types/screening";

export type QuizGroup = {
  id: string;
  title: string;
  blurb: string;
  questions: BooleanQuestionId[];
  includeMenarche?: boolean;
};

export const QUESTION_PROMPTS: Record<BooleanQuestionId, string> = {
  cycleIrregular:
    "Are your periods often hard to predict, or usually shorter than 21 days or longer than expected for you (about 45 days if your first period was recent, or about 35 days if it was 3+ years ago)?",
  gap90:
    "Have you ever gone more than 90 days without a period (when not pregnant and not on meds that stop periods)?",
  skippedMonths:
    "Have you skipped periods for several months in a row, or been told you have secondary amenorrhea?",
  hirsutism:
    "Do you have unwanted hair on your upper lip, chin, chest, stomach, or back more than most people your age?",
  acnePersistent:
    "Do you have acne that has lasted for years or is hard to treat (not just mild teen breakouts)?",
  scalpThinning: "Have you noticed thinning hair on your scalp?",
  elevatedTestosterone:
    "Has a clinician ever told you your testosterone (or free androgen index) is high?",
  weightHard:
    "Do you find it hard to lose weight, or has weight gain been a real concern for you?",
  rapidWeightGain: "Have you had rapid weight gain that worried you?",
  acanthosis:
    "Do you have dark patches around your neck, underarms, or groin (velvety-looking skin)?",
  skinTags: "Do you have skin tags?",
  metabolicHistory:
    "Have you ever been told you have insulin resistance, prediabetes, high blood sugar, high cholesterol, or high blood pressure?",
  familyPcos:
    "Has your mother or any sister been diagnosed with PCOS (or a clinician strongly suspected it)?",
  familyDiabetes: "Does anyone in your close family have type 2 diabetes?",
  lowActivity:
    "Do you usually get little daily movement (far under about 60 minutes of activity most days)?",
  shortSleep: "Do you usually sleep under about 6–7 hours a night?",
  unhealthyDiet:
    "Would you describe your usual diet as often high in sugary or ultra-processed foods?",
  hormonalMeds:
    "Are you currently on hormonal contraception or other meds that affect your cycle?",
  ultrasoundPcom:
    "Have you had a pelvic ultrasound that mentioned polycystic ovaries or many cysts?",
  amhTested: "Have you had an AMH (anti-Müllerian hormone) blood test?",
  moodConcern:
    "For most of the last 2 weeks, have you felt very sad, hopeless, or anxious in a way that worries you?",
};

export const QUESTION_HINTS: Partial<
  Record<BooleanQuestionId | "menarcheAgeYears", string>
> = {
  menarcheAgeYears:
    "Your age at first period helps us interpret cycle patterns (years since menarche). It does not add points by itself.",
  cycleIrregular:
    "In the first year after periods start, irregular cycles are often normal. Later, ongoing irregularity matters more.",
  gap90: "Guideline flag: any cycle >90 days once you are ≥1 year past first period.",
  skippedMonths: "Long multi-month gaps after cycles should have settled are a stronger signal.",
  hirsutism: "Self-reported unwanted hair counts — many people remove hair before clinic visits.",
  acnePersistent: "Mild short-term acne is common; long-lasting hard-to-treat acne scores higher.",
  scalpThinning: "Less common in teens, but important if present.",
  elevatedTestosterone: "Answer No if never tested or told normal. Only Yes if told high.",
  acanthosis: "Often linked to insulin resistance — a metabolic clue, not a PCOS diagnosis.",
  skinTags: "Adjunct insulin-resistance clue; small weight in score.",
  hormonalMeds:
    "Does not add points — helps interpret cycle answers (pill, implant, injection, hormonal IUD, etc.).",
  ultrasoundPcom:
    "For adolescents, ultrasound polycystic findings are NOT used in this risk score (guideline).",
  amhTested: "AMH is not used for adolescent PCOS risk in this tool (guideline).",
  moodConcern:
    "Does not change PCOS risk score. If Yes, consider talking with a trusted adult or professional.",
};

export const QUIZ_GROUPS: QuizGroup[] = [
  {
    id: "A",
    title: "Your timeline",
    blurb: "First period + meds that change cycles",
    includeMenarche: true,
    questions: ["hormonalMeds"],
  },
  {
    id: "B",
    title: "Cycles",
    blurb: "Irregularity and long gaps",
    questions: ["cycleIrregular", "gap90", "skippedMonths"],
  },
  {
    id: "C",
    title: "Skin & hair",
    blurb: "Signs linked to higher androgens",
    questions: [
      "hirsutism",
      "acnePersistent",
      "scalpThinning",
      "elevatedTestosterone",
    ],
  },
  {
    id: "D",
    title: "Body & metabolism",
    blurb: "Weight and insulin-related clues",
    questions: [
      "weightHard",
      "rapidWeightGain",
      "acanthosis",
      "skinTags",
      "metabolicHistory",
    ],
  },
  {
    id: "E",
    title: "Family & lifestyle",
    blurb: "Modifiers — not diagnosis criteria",
    questions: [
      "familyPcos",
      "familyDiabetes",
      "lowActivity",
      "shortSleep",
      "unhealthyDiet",
    ],
  },
  {
    id: "F",
    title: "Tests & wellbeing",
    blurb: "Imaging/AMH not scored; mood is support-only",
    questions: ["ultrasoundPcom", "amhTested", "moodConcern"],
  },
];

export const CATEGORY_COPY: Record<RiskCategory, string> = {
  Low: "Your answers do not show a strong pattern of both irregular cycles and hyperandrogenism signs used in adolescent PCOS education. Symptoms can still matter — track cycles and see a clinician if you are worried.",
  Moderate:
    "Your pattern looks like at-risk screening: about one major feature (cycle irregularity or hyperandrogenism signs) is clearer than the other, or modifiers are elevated. This is not a diagnosis. Follow-up with a healthcare professional is recommended.",
  High: "Your pattern is consistent with both irregular cycles and hyperandrogenism signs used in adolescent PCOS criteria education (Pena et al. 2025). This app still cannot diagnose PCOS or rule out look-alike conditions. Please seek clinical evaluation.",
};

export const DOMAIN_LABELS: Record<string, string> = {
  menstrual: "Menstrual (max 30)",
  hyperandrogenism: "Hyperandrogenism (max 30)",
  family: "Family history (max 15)",
  insulin: "Insulin resistance signs (max 10)",
  bmi: "BMI & weight (max 10)",
  lifestyle: "Lifestyle (max 5)",
};

export const REFERRAL_CHECKLIST = [
  "Note your last few period start dates (or open Cycle history)",
  "List symptoms (acne, hair changes, weight changes, pain, mood) and when they started",
  "Bring a list of medicines / contraceptives / supplements",
  'Write questions: "Could my cycles be irregular for reasons other than PCOS?"',
  "If comfortable, bring a parent/guardian (especially under 18)",
] as const;

export const VISIT_QUESTIONS = [
  "Are my cycles within expected variation for years since my first period?",
  "What else can cause irregular periods or acne besides PCOS?",
  "Do I need labs (e.g. testosterone) — and should ultrasound/AMH wait in adolescence?",
  "What lifestyle steps are safe for me?",
  "When should I follow up if I am at risk with only one feature?",
] as const;

export const SCREEN_INTRO =
  "This questionnaire estimates PCOS-related risk for education using adolescent-focused criteria (irregular cycles by time since first period + clinical/biochemical hyperandrogenism signs). Ultrasound and AMH do not raise your score. Results are Low, Moderate (at risk), or High pattern — never a diagnosis.";