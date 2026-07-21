import { cn } from "@/lib/utils";
import type { CycleInsights } from "@/lib/cycle/insights";

const phaseTone: Record<string, string> = {
  menstrual: "border-rose-300/80 bg-rose-50 text-rose-950 dark:border-rose-500/30 dark:bg-rose-950/45 dark:text-rose-100",
  follicular: "border-sky-300/80 bg-sky-50 text-sky-950 dark:border-sky-500/30 dark:bg-sky-950/45 dark:text-sky-100",
  ovulation: "border-amber-300/80 bg-amber-50 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/45 dark:text-amber-100",
  luteal: "border-violet-300/80 bg-violet-50 text-violet-950 dark:border-violet-500/30 dark:bg-violet-950/45 dark:text-violet-100",
  unknown: "border-border bg-muted text-foreground",
};

const phaseRail: Record<string, string> = {
  menstrual: "bg-rose-500",
  follicular: "bg-sky-500",
  ovulation: "bg-amber-500",
  luteal: "bg-violet-500",
  unknown: "bg-muted-foreground",
};

type Props = {
  insights: CycleInsights;
};

export function CycleInsightsCard({ insights }: Props) {
  const i = insights;

  return (
    <div className="space-y-3">
      <section
        className={cn(
          "relative overflow-hidden rounded-2xl border p-5 shadow-sm",
          phaseTone[i.phase] ?? phaseTone.unknown,
        )}
      >
        <div
          aria-hidden
          className={cn(
            "absolute inset-y-0 left-0 w-1",
            phaseRail[i.phase] ?? phaseRail.unknown,
          )}
        />
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-70">
          {i.cycleDay != null ? `Cycle day ${i.cycleDay}` : "Cycle status"}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          {i.phaseLabel}
        </h2>
        <p className="mt-2 text-sm leading-relaxed opacity-90">
          {i.phaseExplain}
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat
          label="Next expected period"
          value={
            i.nextExpectedStart
              ? formatDisplay(i.nextExpectedStart)
              : "Log a period first"
          }
          hint={
            i.daysUntilExpected == null
              ? undefined
              : i.daysUntilExpected > 0
                ? `In about ${i.daysUntilExpected} day${i.daysUntilExpected === 1 ? "" : "s"}`
                : i.daysUntilExpected === 0
                  ? "Expected around today"
                  : undefined
          }
        />
        <Stat
          label={i.delayedDays ? "Days delayed" : "On-time check"}
          value={
            i.status === "no_data"
              ? "—"
              : i.delayedDays
                ? `${i.delayedDays} day${i.delayedDays === 1 ? "" : "s"} late`
                : i.status === "need_more"
                  ? "Need 2+ logs"
                  : "Not delayed"
          }
          hint={
            i.delayedDays
              ? "Count from your usual cycle length after last start. Late periods are common — log when flow begins."
              : i.avgCycleLength
                ? `Using avg cycle ${i.avgCycleLength} days`
                : "Using default 28-day estimate until 2 logs"
          }
          alert={!!i.delayedDays}
        />
        <Stat
          label="Avg cycle length"
          value={
            i.avgCycleLength != null ? `${i.avgCycleLength} days` : "Default 28d"
          }
          hint={
            i.cycleLengths.length
              ? `From ${i.cycleLengths.length} interval${i.cycleLengths.length === 1 ? "" : "s"}`
              : "After 2 period starts we average gaps"
          }
        />
        <Stat
          label="Avg period length"
          value={`${i.avgPeriodLength} days`}
          hint="From logged durations (or 5 if empty)"
        />
      </div>

      <p className="px-1 text-xs leading-relaxed text-muted-foreground">
        Phases use a simple educational model (period → follicular → ovulation
        window → luteal). Not fertility tracking medical advice; irregular cycles
        (common with PCOS / teens) make estimates less precise.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  alert,
}: {
  label: string;
  value: string;
  hint?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={cn(
        "surface-card rounded-2xl p-4",
        alert && "border-amber-300/70 bg-amber-50/55 dark:border-amber-500/30 dark:bg-amber-950/35",
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold tracking-tight",
          alert && "text-amber-900 dark:text-amber-100",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function formatDisplay(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
