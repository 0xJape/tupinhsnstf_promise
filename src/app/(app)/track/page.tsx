import { redirect } from "next/navigation";
import { CheckCircle2, Trash2 } from "lucide-react";
import { deleteDailyWellnessLog } from "@/app/(app)/track/actions";
import { DailyWellnessForm } from "@/components/tracking/DailyWellnessForm";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const today = new Date().toLocaleDateString("en-CA");

type Props = { searchParams: Promise<{ saved?: string; error?: string; already?: string }> };

export default async function TrackPage({ searchParams }: Props) {
  const { saved, error, already } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: logs } = await supabase
    .from("daily_wellness_logs")
    .select("id, log_date, pain_level, fatigue_level, mood, acne_change, sleep_hours, activity_minutes, stress_level, notes")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(14);
  const todayEntry = logs?.find((log) => log.log_date === today);

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="section-label text-primary">Daily check-in</p>
        <h1 className="text-2xl font-semibold tracking-tight">Track how you feel</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">Optional self-report. One entry per day. Not a diagnosis or clinical record.</p>
      </header>

      {saved ? <p className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">Daily entry saved.</p> : null}
      {already ? <p className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">You already completed today’s check-in.</p> : null}
      {error ? <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      {todayEntry ? <section className="surface-card rounded-3xl p-5"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary"><CheckCircle2 className="size-5" /></span><div><h2 className="font-semibold">Today’s check-in is complete</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Your entry is saved. Come back tomorrow; no need to submit it again.</p></div></div></section> : <DailyWellnessForm today={today} />}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Recent entries</h2>
        {!logs?.length ? <p className="surface-muted rounded-3xl border border-dashed border-border px-5 py-6 text-center text-sm text-muted-foreground">No daily entries yet. Log only what feels useful.</p> : (
          <ul className="surface-card overflow-hidden rounded-3xl">
            {logs.map((log, index) => (
              <li key={log.id} className={`flex gap-3 px-4 py-3 ${index ? "border-t border-border" : ""}`}>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{formatDate(log.log_date)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{summary(log)}</p>
                  {log.notes ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{log.notes}</p> : null}
                </div>
                <form action={deleteDailyWellnessLog}>
                  <input type="hidden" name="id" value={log.id} />
                  <Button type="submit" variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label={`Delete entry for ${log.log_date}`}><Trash2 className="size-4" /></Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function summary(log: { pain_level: number | null; fatigue_level: number | null; mood: string | null; acne_change: string | null; sleep_hours: number | null; activity_minutes: number | null; stress_level: number | null }) {
  return [log.pain_level != null && `pain ${log.pain_level}/10`, log.fatigue_level != null && `fatigue ${log.fatigue_level}/10`, log.mood, log.acne_change && `acne ${log.acne_change}`, log.sleep_hours != null && `${log.sleep_hours}h sleep`, log.activity_minutes != null && `${log.activity_minutes}m activity`, log.stress_level != null && `stress ${log.stress_level}/5`].filter(Boolean).join(" · ") || "No measures recorded";
}
