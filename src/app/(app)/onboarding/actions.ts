"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function numOrNull(raw: string) {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export type FinishOnboardingInput = {
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

export async function finishOnboarding(input: FinishOnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const height = numOrNull(input.height_cm);
  const weight = numOrNull(input.weight_kg);
  if (height == null || weight == null) {
    return { error: "Height and weight are required to finish setup." };
  }

  const stressRaw = input.stress_level.trim();
  const stress = stressRaw ? Number(stressRaw) : null;
  if (
    stress === null ||
    !Number.isInteger(stress) ||
    stress < 1 ||
    stress > 5
  ) {
    return { error: "Pick a stress level from 1 to 5." };
  }

  if (!input.activity_level || !input.exercise_frequency || !input.sleep_band) {
    return { error: "Finish activity, exercise, and sleep choices." };
  }
  if (!input.alcohol_band || (input.smoking !== "true" && input.smoking !== "false")) {
    return { error: "Answer smoking and alcohol questions." };
  }

  let family = input.family_history.filter(Boolean);
  if (family.includes("none")) family = ["none"];
  let conditions = input.conditions.filter(Boolean);
  if (conditions.includes("none")) conditions = ["none"];

  const { error } = await supabase
    .from("profiles")
    .update({
      height_cm: height,
      weight_kg: weight,
      waist_cm: numOrNull(input.waist_cm),
      family_history: family,
      conditions,
      activity_level: input.activity_level,
      exercise_frequency: input.exercise_frequency,
      sleep_band: input.sleep_band,
      stress_level: stress,
      smoking: input.smoking === "true",
      alcohol_band: input.alcohol_band,
      mobile_number: input.mobile_number.trim() || null,
      onboarding_complete: true,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  redirect("/home?setup=1");
}
