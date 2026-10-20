import { AppShell } from "@/components/layout/AppShell";
import { DailyPromiGuide } from "@/components/layout/DailyPromiGuide";
import { computeCycleInsights, type PeriodLog } from "@/lib/cycle/insights";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toLocaleDateString("en-CA");
  let guide = null;

  if (user) {
    const [{ data: periodRows }, { data: todayEntry }] = await Promise.all([
      supabase
        .from("menstrual_logs")
        .select("id, start_date, duration_days")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false }),
      supabase
        .from("daily_wellness_logs")
        .select("id")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .maybeSingle(),
    ]);
    const insights = computeCycleInsights((periodRows ?? []) as PeriodLog[]);
    guide = <DailyPromiGuide userId={user.id} today={today} hasCheckIn={Boolean(todayEntry)} insights={insights} />;
  }

  return <AppShell notification={guide}>{children}</AppShell>;
}
