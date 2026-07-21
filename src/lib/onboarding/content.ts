/** Guided setup copy — plain language, educational (not diagnosis). */

export const FAMILY_OPTIONS = [
  {
    id: "pcos",
    label: "PCOS or irregular periods in family",
    why: "Family patterns can raise the chance of similar hormone issues. This is only one clue among many.",
  },
  {
    id: "diabetes",
    label: "Type 2 diabetes in family",
    why: "Insulin and blood sugar run in families and often show up with PCOS-related risk.",
  },
  {
    id: "thyroid",
    label: "Thyroid problems in family",
    why: "Thyroid issues can look like cycle changes. Knowing family history helps you talk with a clinician later.",
  },
  {
    id: "heart",
    label: "Early heart disease in family",
    why: "Metabolic risk sometimes clusters with hormone and weight patterns.",
  },
  {
    id: "none",
    label: "None of these / not sure",
    why: "Totally fine. “Not sure” is better than guessing.",
  },
] as const;

export const CONDITION_OPTIONS = [
  {
    id: "irregular_cycles",
    label: "Irregular or very long cycles",
    why: "Cycles that jump around a lot are a common reason people look into PCOS education.",
  },
  {
    id: "acne_hirsutism",
    label: "Persistent acne or extra facial/body hair",
    why: "These can relate to androgens (male-type hormones). Still not a diagnosis by itself.",
  },
  {
    id: "weight_gain",
    label: "Hard-to-explain weight gain around middle",
    why: "Where weight sits can matter for metabolic health — one piece of the bigger picture.",
  },
  {
    id: "diagnosed_pcos",
    label: "Already told I may have PCOS",
    why: "Helps us tailor education. This app still does not diagnose or replace your clinician.",
  },
  {
    id: "none",
    label: "None of these",
    why: "You can still track cycles and learn — no symptoms required to use the app.",
  },
] as const;

export const ACTIVITY_OPTIONS = [
  {
    value: "sedentary",
    label: "Mostly sitting",
    why: "Desk / school / commute days with little movement. Honest baseline helps later tips.",
  },
  {
    value: "light",
    label: "Light movement",
    why: "Some walking or chores, not much planned exercise.",
  },
  {
    value: "moderate",
    label: "Moderate",
    why: "Active a few days a week — sports, walks, gym, dance, etc.",
  },
  {
    value: "active",
    label: "Very active",
    why: "Training or hard physical work most days.",
  },
] as const;

export const EXERCISE_OPTIONS = [
  {
    value: "none",
    label: "Rarely / never",
    why: "No judgment — we start where you are.",
  },
  {
    value: "1-2/week",
    label: "1–2 times a week",
    why: "A solid start; consistency beats intensity.",
  },
  {
    value: "3-4/week",
    label: "3–4 times a week",
    why: "Common “regular exercise” band for lifestyle tips.",
  },
  {
    value: "5+/week",
    label: "5+ times a week",
    why: "High frequency — still include rest and recovery.",
  },
] as const;

export const SLEEP_OPTIONS = [
  {
    value: "<6h",
    label: "Under 6 hours",
    why: "Short sleep can mess with hunger, mood, and cycle regularity for some people.",
  },
  {
    value: "6-7h",
    label: "About 6–7 hours",
    why: "Common for students — may still feel tired.",
  },
  {
    value: "7-9h",
    label: "About 7–9 hours",
    why: "Often the sweet spot many guidelines suggest for teens/young adults.",
  },
  {
    value: ">9h",
    label: "Over 9 hours",
    why: "Extra sleep can be recovery — or a sign you’re wiped out. Either is useful context.",
  },
] as const;

export const STRESS_OPTIONS = [
  {
    value: 1,
    label: "1 — Very calm",
    why: "Life feels manageable most days.",
  },
  {
    value: 2,
    label: "2 — Mild stress",
    why: "Some pressure, but you bounce back quickly.",
  },
  {
    value: 3,
    label: "3 — Moderate",
    why: "School, work, or home stress shows up often.",
  },
  {
    value: 4,
    label: "4 — High",
    why: "Stress is heavy most weeks; sleep or mood may take hits.",
  },
  {
    value: 5,
    label: "5 — Overwhelming",
    why: "Hard to cope day to day. This app is support only — reach a trusted adult or professional if you need help.",
  },
] as const;

export const ALCOHOL_OPTIONS = [
  {
    value: "none",
    label: "I don’t drink",
    why: "Common and healthy choice — especially under legal age.",
  },
  {
    value: "occasional",
    label: "Rare / special occasions",
    why: "A few times a year or less.",
  },
  {
    value: "weekly",
    label: "Most weeks",
    why: "Regular but not daily — useful lifestyle context only.",
  },
  {
    value: "frequent",
    label: "Several times a week",
    why: "Higher frequency. We store this privately for your profile, not to judge.",
  },
] as const;

export type OnboardingDraft = {
  height_cm: string;
  weight_kg: string;
  waist_cm: string;
  family_history: string[];
  conditions: string[];
  activity_level: string;
  exercise_frequency: string;
  sleep_band: string;
  stress_level: string;
  smoking: string;
  alcohol_band: string;
  mobile_number: string;
};

export const emptyDraft = (): OnboardingDraft => ({
  height_cm: "",
  weight_kg: "",
  waist_cm: "",
  family_history: [],
  conditions: [],
  activity_level: "",
  exercise_frequency: "",
  sleep_band: "",
  stress_level: "",
  smoking: "",
  alcohol_band: "",
  mobile_number: "",
});

export const STEP_META = [
  { id: "welcome", title: "Welcome setup", short: "Start" },
  { id: "body", title: "Your body basics", short: "Body" },
  { id: "family", title: "Family health clues", short: "Family" },
  { id: "conditions", title: "What you’ve noticed", short: "Health" },
  { id: "lifestyle", title: "Daily rhythm", short: "Lifestyle" },
  { id: "stress", title: "Stress check-in", short: "Stress" },
  { id: "habits", title: "Smoking & alcohol", short: "Habits" },
  { id: "contact", title: "Stay in touch", short: "Contact" },
  { id: "review", title: "Review & finish", short: "Review" },
] as const;

export type StepId = (typeof STEP_META)[number]["id"];
