"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function first(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function savePeriodLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const startDate = first(formData, "start_date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    redirect("/cycle/new?error=Pick%20a%20valid%20start%20date");
  }

  const durationRaw = first(formData, "duration_days");
  let duration_days: number | null = null;
  if (durationRaw) {
    const n = Number(durationRaw);
    if (!Number.isInteger(n) || n < 1 || n > 14) {
      redirect("/cycle/new?error=Duration%20must%20be%201%E2%80%9314%20days");
    }
    duration_days = n;
  }

  const flow = first(formData, "flow");
  if (flow && !["light", "medium", "heavy"].includes(flow)) {
    redirect("/cycle/new?error=Invalid%20flow");
  }

  const painRaw = first(formData, "pain_level");
  let pain_level: number | null = null;
  if (painRaw) {
    const n = Number(painRaw);
    if (!Number.isInteger(n) || n < 0 || n > 10) {
      redirect("/cycle/new?error=Pain%20must%20be%200%E2%80%9310");
    }
    pain_level = n;
  }

  const notes = first(formData, "notes") || null;

  const { error } = await supabase.from("menstrual_logs").upsert(
    {
      user_id: user.id,
      start_date: startDate,
      duration_days,
      flow: flow || null,
      pain_level,
      notes,
    },
    { onConflict: "user_id,start_date" },
  );

  if (error) {
    redirect(`/cycle/new?error=${encodeURIComponent(error.message)}&date=${startDate}`);
  }

  revalidatePath("/cycle");
  redirect("/cycle?saved=1");
}

export async function deletePeriodLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = first(formData, "id");
  if (!id) redirect("/cycle");

  await supabase.from("menstrual_logs").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/cycle");
  redirect("/cycle");
}
