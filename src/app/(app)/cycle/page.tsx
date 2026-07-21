import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { CycleCalendar } from "@/components/cycle/CycleCalendar";
import { CycleInsightsCard } from "@/components/cycle/CycleInsightsCard";
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

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Cycle</h1>
          <p className="text-sm text-muted-foreground">
            Log periods, see phase estimates, next period, and delay.
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

      <CycleInsightsCard insights={insights} />

      <CycleCalendar
        periodDates={periodDates}
        expectedDates={expectedDates}
        phaseDates={phaseDates}
      />

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
