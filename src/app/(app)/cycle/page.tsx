import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, ClipboardList, Droplets, Plus, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { CycleCalendar } from "@/components/cycle/CycleCalendar";
import { CycleInsightsCard } from "@/components/cycle/CycleInsightsCard";
import { PhaseGuide } from "@/components/cycle/PhaseGuide";
import { FirstLogButton } from "@/components/cycle/FirstLogButton";
import { PatternSummary } from "@/components/cycle/PatternSummary";
import { deletePeriodLog } from "@/app/(app)/cycle/actions";
import {
  computeCycleInsights,
  expandExpectedPeriodDays,
  expandPeriodDays,
  expandPhaseDays,
  type PeriodLog,
} from "@/lib/cycle/insights";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function CyclePage({ searchParams }: Props) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("menstrual_logs")
    .select("id, start_date, duration_days, flow, pain_level, notes")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false });

  const logs: PeriodLog[] = (rows ?? []).map((r) => ({
    id: r.id,
    start_date: r.start_date,
    duration_days: r.duration_days,
  }));

  const insights = computeCycleInsights(logs);
  const periodDates = expandPeriodDays(logs, insights.avgPeriodLength);
  const expectedDates = expandExpectedPeriodDays(
    insights.nextExpectedStart,
    insights.avgPeriodLength,
  );
  const cycleLen = insights.avgCycleLength ?? 28;
  const phaseDates = expandPhaseDays(
    insights.lastStart,
    insights.avgPeriodLength,
    cycleLen,
  );
  const today = new Date().toLocaleDateString("en-CA");
  const { data: todayCheckIn } = await supabase
    .from("daily_wellness_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("log_date", today)
    .maybeSingle();
  const { data: recentDailyLogs } = await supabase
    .from("daily_wellness_logs")
    .select("id")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(14);
  const logPeriod = insights.status === "period_window" || insights.status === "delayed" || !logs.length;
  const nextHref = logPeriod ? "/cycle/new?guided=1" : "/track?guided=1";
  const nextLabel = logPeriod ? "Log a period start" : todayCheckIn ? "View today’s check-in" : "Check in today";

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Cycle</h1>
          <p className="text-sm text-muted-foreground">
            Today first. Your calendar stays below.
          </p>
        </div>
        <Link
          href="/cycle/new"
          className={cn(
            buttonVariants({ size: "sm" }),
            "min-h-10 shrink-0 rounded-xl",
          )}
        >
          <Plus className="size-4" aria-hidden />
          Log
        </Link>
      </header>

      {saved ? (
        <p className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
          Period log saved.
        </p>
      ) : null}

      <section className="cycle-today-card overflow-hidden rounded-[2rem] p-5" aria-label="Today in your cycle">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-label text-primary">Today</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">{insights.cycleDay ? `Cycle day ${insights.cycleDay}` : "Start your picture"}</h2>
            <p className="mt-2 max-w-[22rem] text-sm leading-relaxed text-muted-foreground">{insights.logCount >= 2 ? `${insights.phaseLabel} is an estimate from your logged dates.` : "Add period starts over time for more personal estimates."}</p>
          </div>
          <span className="cycle-day-orb" aria-hidden>{insights.cycleDay ?? "?"}</span>
        </div>
        <div className="mt-5 rounded-2xl bg-background/75 p-4 dark:bg-black/15">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">{todayCheckIn ? <CheckCircle2 className="size-5" /> : logPeriod ? <Droplets className="size-5" /> : <ClipboardList className="size-5" />}</span>
            <div className="min-w-0 flex-1"><p className="font-semibold">{todayCheckIn ? "Checked in today" : logPeriod ? "One useful update" : "Your small next step"}</p><p className="text-xs leading-relaxed text-muted-foreground">{todayCheckIn ? "Your private note is saved. Come back tomorrow if useful." : logPeriod ? "If bleeding began, add its first day. Everything else is optional." : "A short self-report can help you notice patterns."}</p></div>
          </div>
          {!logs.length ? <FirstLogButton /> : <Link href={todayCheckIn ? "/track" : nextHref} className={cn(buttonVariants({ size: "lg" }), "mt-4 min-h-11 w-full rounded-xl")}>{nextLabel}<ArrowRight className="size-4" /></Link>}
        </div>
      </section>

      {insights.status === "period_window" || insights.status === "delayed" ? <aside className="cycle-alert rounded-2xl px-4 py-3 text-sm leading-relaxed"><strong>{insights.status === "delayed" ? "No period start logged after your estimate." : "Estimated period window is here."}</strong>{" "}Cycles can vary. Log only if bleeding begins.</aside> : insights.logCount < 2 && logs.length ? <aside className="cycle-alert rounded-2xl px-4 py-3 text-sm leading-relaxed"><strong>One more logged start helps.</strong> Two or more cycle starts make estimates more personal.</aside> : null}

      {insights.logCount >= 2 ? <PhaseGuide phase={insights.phase} cycleDay={insights.cycleDay} card /> : null}

      <PatternSummary cycleLogCount={logs.length} dailyLogCount={recentDailyLogs?.length ?? 0} />

      <details className="group"><summary className="cursor-pointer list-none rounded-2xl px-1 text-sm font-semibold text-muted-foreground">Cycle details <span className="ml-1 text-primary group-open:hidden">Show</span><span className="ml-1 hidden text-primary group-open:inline">Hide</span></summary><div className="pt-3"><CycleInsightsCard insights={insights} /></div></details>

      <section className="space-y-3" aria-label="Cycle calendar"><div className="flex items-center justify-between px-1"><div><p className="section-label text-primary">History</p><h2 className="mt-1 text-lg font-semibold">Your cycle calendar</h2></div><span className="text-xs text-muted-foreground">Tap day to log</span></div><CycleCalendar periodDates={periodDates} expectedDates={expectedDates} phaseDates={phaseDates} /></section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Your logs
          </h2>
          <Link
            href="/cycle/new"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-xl",
            )}
          >
            <Plus className="size-4" aria-hidden />
            Add
          </Link>
        </div>

        {!rows?.length ? (
          <div className="surface-muted rounded-3xl border border-dashed border-border px-5 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No periods logged yet. Add your last start date — after two cycles
              we estimate length, phases, and delay.
            </p>
            <Link
              href="/cycle/new"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-4 min-h-11 rounded-xl",
              )}
            >
              <Plus className="size-4" aria-hidden />
              Log first period
            </Link>
          </div>
        ) : (
          <ul className="surface-card overflow-hidden">
            {rows.map((log, idx) => (
              <li
                key={log.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  idx > 0 && "border-t border-border",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {formatDisplay(log.start_date)}
                    {idx === 0 ? (
                      <span className="ml-2 text-xs font-normal text-primary">
                        latest
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.duration_days != null
                      ? `${log.duration_days} day${log.duration_days === 1 ? "" : "s"}`
                      : "Duration not set"}
                    {log.flow ? ` · ${log.flow} flow` : ""}
                    {log.pain_level != null ? ` · pain ${log.pain_level}/10` : ""}
                  </p>
                </div>
                <form action={deletePeriodLog}>
                  <input type="hidden" name="id" value={log.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                    aria-label="Delete log"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatDisplay(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

