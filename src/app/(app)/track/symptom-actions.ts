"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowed = {
  frequency: ["once", "occasional", "frequent", "constant"],
  change: ["improved", "same", "worsened"],
};

export async function saveSymptomRecord(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const severity = Number(text("severity"));
  const symptom = text("symptom");
  const bodyArea = text("body_area");
  const occurredOn = text("occurred_on");
  const frequency = text("frequency");
  const change = text("change");
  const duration = text("duration");
  const notes = text("notes");
  if (!symptom || symptom.length > 80 || !bodyArea || bodyArea.length > 80 || !/^\d{4}-\d{2}-\d{2}$/.test(occurredOn) || !Number.isInteger(severity) || severity < 1 || severity > 5 || !allowed.frequency.includes(frequency) || !allowed.change.includes(change) || notes.length > 500) redirect("/track?error=Check%20your%20symptom%20entry");
  const { error } = await supabase.from("symptom_records").insert({ user_id: user.id, symptom, body_area: bodyArea, occurred_on: occurredOn, severity, frequency, duration: duration || null, change, notes: notes || null });
  if (error) redirect(`/track?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/track");
  redirect("/track?symptom_saved=1");
}

export async function deleteSymptomRecord(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  if (id) await supabase.from("symptom_records").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/track");
  redirect("/track");
}

export async function updateSymptomRecord(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const id = text("id");
  const severity = Number(text("severity"));
  const symptom = text("symptom");
  const bodyArea = text("body_area");
  const occurredOn = text("occurred_on");
  const frequency = text("frequency");
  const change = text("change");
  const duration = text("duration");
  const notes = text("notes");
  if (!id || !symptom || symptom.length > 80 || !bodyArea || bodyArea.length > 80 || !/^\d{4}-\d{2}-\d{2}$/.test(occurredOn) || !Number.isInteger(severity) || severity < 1 || severity > 5 || !allowed.frequency.includes(frequency) || !allowed.change.includes(change) || notes.length > 500) redirect("/track?error=Check%20your%20symptom%20entry");
  const { error } = await supabase.from("symptom_records").update({ symptom, body_area: bodyArea, occurred_on: occurredOn, severity, frequency, duration: duration || null, change, notes: notes || null }).eq("id", id).eq("user_id", user.id);
  if (error) redirect(`/track?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/track");
  revalidatePath("/journey");
  redirect("/track?symptom_saved=1");
}
