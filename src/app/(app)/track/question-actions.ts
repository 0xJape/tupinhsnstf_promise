"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveClinicianQuestion(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const question = String(formData.get("question") ?? "").trim();
  if (!question || question.length > 500) redirect("/track?error=Enter%20a%20question%20under%20500%20characters");
  const { error } = await supabase.from("clinician_questions").insert({ user_id: user.id, question });
  if (error) redirect(`/track?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/track");
  revalidatePath("/journey");
  redirect("/track?question_saved=1");
}

export async function deleteClinicianQuestion(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  if (id) await supabase.from("clinician_questions").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/track");
  redirect("/track");
}