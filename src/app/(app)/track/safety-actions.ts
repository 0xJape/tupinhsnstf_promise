"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveSafetyCheckin(formData: FormData) {
  const status = String(formData.get("status") ?? "");
  if (status !== "safe" && status !== "need_support") redirect("/track?error=Invalid%20safety%20check-in");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.from("safety_checkins").upsert({ user_id: user.id, status, checkin_date: new Date().toISOString().slice(0, 10) }, { onConflict: "user_id,checkin_date" });
  if (error) redirect(`/track?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/track");
  redirect(`/track?safety=${status}`);
}
