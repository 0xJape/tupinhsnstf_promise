"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import type { DayButton } from "react-day-picker";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { PHASE_LEGEND } from "@/lib/cycle/insights";
import { cn } from "@/lib/utils";

type PhaseDates = {
  menstrual?: string[];
  follicular?: string[];
  ovulation?: string[];
  luteal?: string[];
};

type Props = {
  periodDates?: string[];
  expectedDates?: string[];
  phaseDates?: PhaseDates;
  className?: string;
};

function toDates(ymds: string[] = []) {
  return ymds.map((d) => parseISO(d));
}

const SELECTED =
  "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground";

function dayTooltip(modifiers: Record<string, boolean>): string | undefined {
  const labels: string[] = [];
  if (modifiers.menstrual) labels.push("Menstrual phase");
  if (modifiers.follicular) labels.push("Follicular phase");
  if (modifiers.ovulation) labels.push("Ovulation window");
  if (modifiers.luteal) labels.push("Luteal phase");
  if (modifiers.expected) labels.push("Expected period");
  return labels.length ? labels.join(" · ") : undefined;
}

function PhaseDayButton(props: React.ComponentProps<typeof DayButton>) {
  const title = dayTooltip(props.modifiers as Record<string, boolean>);
  return <CalendarDayButton {...props} title={title} />;
}

export function CycleCalendar({
  periodDates = [],
  expectedDates = [],
  phaseDates,
  className,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Date | undefined>();
  const [month, setMonth] = React.useState<Date>(new Date());

  const menstrual = React.useMemo(() => {
    const set = new Set([...(phaseDates?.menstrual ?? []), ...periodDates]);
    return toDates([...set]);
  }, [phaseDates?.menstrual, periodDates]);
  const follicular = React.useMemo(
    () => toDates(phaseDates?.follicular),
    [phaseDates?.follicular],
  );
  const ovulation = React.useMemo(
    () => toDates(phaseDates?.ovulation),
    [phaseDates?.ovulation],
  );
  const luteal = React.useMemo(
    () => toDates(phaseDates?.luteal),
    [phaseDates?.luteal],
  );
  const expectedDays = React.useMemo(
    () => toDates(expectedDates),
    [expectedDates],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="surface-card overflow-hidden rounded-3xl p-3">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={selected}
          onSelect={(day) => {
            setSelected(day);
            if (day) {
              router.push(`/cycle/new?date=${format(day, "yyyy-MM-dd")}`);
            }
          }}
          modifiers={{
            menstrual,
            follicular,
            ovulation,
            luteal,
            expected: expectedDays,
          }}
          modifiersClassNames={{
            menstrual: cn(
              "bg-rose-200/90 text-rose-950 font-semibold dark:bg-rose-700 dark:text-white dark:ring-1 dark:ring-rose-400/70",
              SELECTED,
            ),
            follicular: cn("bg-sky-100 text-sky-900 dark:bg-sky-700 dark:text-white dark:ring-1 dark:ring-sky-400/70", SELECTED),
            ovulation: cn(
              "bg-amber-200/90 text-amber-950 font-semibold ring-1 ring-amber-400/50 dark:bg-amber-600 dark:text-white dark:ring-amber-300/80",
              SELECTED,
            ),
            luteal: cn("bg-violet-100 text-violet-900 dark:bg-violet-700 dark:text-white dark:ring-1 dark:ring-violet-400/70", SELECTED),
            expected: cn(
              "bg-rose-50 text-rose-800 ring-1 ring-dashed ring-rose-300/80 dark:bg-rose-950 dark:text-rose-100 dark:ring-rose-400",
              SELECTED,
            ),
          }}
          components={{ DayButton: PhaseDayButton }}
          className="w-full [--cell-size:2.65rem] bg-transparent p-1"
          classNames={{
            root: "w-full",
            month: "w-full",
            month_grid: "w-full",
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-1 text-xs text-muted-foreground">
        {PHASE_LEGEND.map((item) => (
          <span key={item.phase} className="inline-flex items-center gap-1.5">
            <span
              className={cn("size-2.5 rounded-full", item.swatch)}
              aria-hidden
            />
            {item.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full border border-dashed border-rose-400 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/60"
            aria-hidden
          />
          Expected period
        </span>
        <span className="text-muted-foreground/80">Tap day to log</span>
      </div>

      {selected ? (
        <p className="px-1 text-sm text-muted-foreground">
          Selected{" "}
          <strong className="font-medium text-foreground">
            {format(selected, "MMM d, yyyy")}
          </strong>
        </p>
      ) : null}
    </div>
  );
}
