"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function optionalInt(formData: FormData, name: string, min: number, max: number) {
  const raw = value(formData, name);
  if (!raw) return null;
  const number = Number(raw);
  if (!Number.isInteger(number) || number < min || number > max) return undefined;
  return number;
}

function optionalNumber(formData: FormData, name: string, min: number, max: number) {
  const raw = value(formData, name);
  if (!raw) return null;
  const number = Number(raw);
  if (!Number.isFinite(number) || number < min || number > max) return undefined;
  return number;
}

export async function saveDailyWellnessLog(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const log_date = value(formData, "log_date");
  const pain_level = optionalInt(formData, "pain_level", 0, 10);
  const fatigue_level = optionalInt(formData, "fatigue_level", 0, 10);
  const sleep_hours = optionalNumber(formData, "sleep_hours", 0, 24);
  const activity_minutes = optionalInt(formData, "activity_minutes", 0, 1440);
  const stress_level = optionalInt(formData, "stress_level", 1, 5);
  const mood = value(formData, "mood");
  const acne_change = value(formData, "acne_change");
  const notes = value(formData, "notes");

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(log_date) ||
    [pain_level, fatigue_level, sleep_hours, activity_minutes, stress_level].includes(undefined) ||
    !["", "low", "okay", "good"].includes(mood) ||
    !["", "none", "mild", "moderate", "severe"].includes(acne_change) ||
    notes.length > 500
  ) {
    redirect("/track?error=Check%20your%20daily%20entry");
  }

  const { data: existing } = await supabase
    .from("daily_wellness_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("log_date", log_date)
    .maybeSingle();
  if (existing) redirect("/track?already=1");

  const { error } = await supabase.from("daily_wellness_logs").insert(
    {
      user_id: user.id,
      log_date,
      pain_level,
      fatigue_level,
      mood: mood || null,
      acne_change: acne_change || null,
      sleep_hours,
      activity_minutes,
      stress_level,
      notes: notes || null,
    },
  );

  if (error) redirect(`/track?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/track");
  revalidatePath("/home");
  redirect("/track?saved=1");
}

export async function deleteDailyWellnessLog(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = value(formData, "id");
  if (id) await supabase.from("daily_wellness_logs").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/track");
  redirect("/track");
}
