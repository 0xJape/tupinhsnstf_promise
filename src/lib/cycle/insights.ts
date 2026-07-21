/**
 * Educational cycle math from period start dates.
 * Not a medical device — textbook-style phases for awareness only.
 */

export type PeriodLog = {
  id?: string;
  start_date: string; // yyyy-MM-dd
  duration_days: number | null;
};

export type CyclePhase =
  | "menstrual"
  | "follicular"
  | "ovulation"
  | "luteal"
  | "unknown";

export type CycleInsights = {
  logCount: number;
  avgCycleLength: number | null;
  avgPeriodLength: number;
  lastStart: string | null;
  nextExpectedStart: string | null;
  /** Days until next expected start; 0 = due today; negative = delayed by |n| days */
  daysUntilExpected: number | null;
  delayedDays: number | null;
  status: "no_data" | "need_more" | "on_track" | "period_window" | "delayed";
  /** Current estimated phase if we have a last start + cycle length */
  phase: CyclePhase;
  phaseLabel: string;
  phaseExplain: string;
  cycleDay: number | null;
  cycleLengths: number[];
};

const DEFAULT_CYCLE = 28;
const DEFAULT_PERIOD = 5;
const MIN_CYCLE = 18;
const MAX_CYCLE = 45;

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(ymd: string, days: number): string {
  const d = parseYmd(ymd);
  d.setDate(d.getDate() + days);
  return formatYmd(d);
}

function diffDays(fromYmd: string, toYmd: string): number {
  const a = parseYmd(fromYmd);
  const b = parseYmd(toYmd);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function todayYmd(now = new Date()): string {
  return formatYmd(now);
}

/** Sorted ascending by start_date */
export function sortLogs(logs: PeriodLog[]): PeriodLog[] {
  return [...logs].sort((a, b) => a.start_date.localeCompare(b.start_date));
}

export function cycleLengthsBetween(logs: PeriodLog[]): number[] {
  const sorted = sortLogs(logs);
  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const len = diffDays(sorted[i - 1].start_date, sorted[i].start_date);
    if (len >= MIN_CYCLE && len <= MAX_CYCLE) lengths.push(len);
  }
  return lengths;
}

export function average(nums: number[]): number | null {
  if (!nums.length) return null;
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
}

export function avgPeriodLength(logs: PeriodLog[]): number {
  const durs = logs
    .map((l) => l.duration_days)
    .filter((d): d is number => d != null && d >= 1 && d <= 14);
  return average(durs) ?? DEFAULT_PERIOD;
}

function phaseForCycleDay(
  cycleDay: number,
  periodLen: number,
  cycleLen: number,
): { phase: CyclePhase; label: string; explain: string } {
  // Luteal ~14 days; ovulation ~ cycleLen - 14
  const ovulationDay = Math.max(periodLen + 1, cycleLen - 14);
  const ovStart = Math.max(periodLen + 1, ovulationDay - 1);
  const ovEnd = Math.min(cycleLen, ovulationDay + 1);

  if (cycleDay >= 1 && cycleDay <= periodLen) {
    return {
      phase: "menstrual",
      label: "Menstrual phase",
      explain:
        "Bleeding days (cycle day 1 = first day of flow). Energy may be lower — rest is OK.",
    };
  }
  if (cycleDay < ovStart) {
    return {
      phase: "follicular",
      label: "Follicular phase",
      explain:
        "After bleeding, estrogen often rises and many people feel more energy. Follicles prepare an egg.",
    };
  }
  if (cycleDay >= ovStart && cycleDay <= ovEnd) {
    return {
      phase: "ovulation",
      label: "Ovulation window",
      explain:
        "Around mid-cycle (≈14 days before next period in a textbook cycle). Fertile window estimate only — not contraception advice.",
    };
  }
  if (cycleDay <= cycleLen) {
    return {
      phase: "luteal",
      label: "Luteal phase",
      explain:
        "After ovulation until the next period. PMS symptoms can show up here for some people.",
    };
  }
  // Past expected cycle end → still show luteal-ish / delayed context
  return {
    phase: "luteal",
    label: "Past expected cycle length",
    explain:
      "You are past your usual cycle length. Periods can run late for many reasons (stress, travel, PCOS patterns). Log when flow starts.",
  };
}

export function computeCycleInsights(
  logs: PeriodLog[],
  now: Date = new Date(),
): CycleInsights {
  const sorted = sortLogs(logs);
  const today = todayYmd(now);
  const lengths = cycleLengthsBetween(sorted);
  const avgCycle = average(lengths);
  const periodLen = avgPeriodLength(sorted);
  const last = sorted.length ? sorted[sorted.length - 1] : null;

  if (!last) {
    return {
      logCount: 0,
      avgCycleLength: null,
      avgPeriodLength: periodLen,
      lastStart: null,
      nextExpectedStart: null,
      daysUntilExpected: null,
      delayedDays: null,
      status: "no_data",
      phase: "unknown",
      phaseLabel: "No cycle data yet",
      phaseExplain:
        "Log your period start date. After 2+ periods we estimate length, next period, and phases.",
      cycleDay: null,
      cycleLengths: [],
    };
  }

  const cycleLen = avgCycle ?? DEFAULT_CYCLE;
  const nextExpected = addDays(last.start_date, cycleLen);
  const daysUntil = diffDays(today, nextExpected);
  const delayedDays = daysUntil < 0 ? Math.abs(daysUntil) : null;
  const cycleDay = diffDays(last.start_date, today) + 1;

  let status: CycleInsights["status"] = "on_track";
  if (sorted.length < 2) status = "need_more";
  else if (delayedDays != null && delayedDays > 0) status = "delayed";
  else if (daysUntil >= 0 && daysUntil < periodLen) status = "period_window";

  const { phase, label, explain } =
    cycleDay < 1
      ? {
          phase: "unknown" as const,
          label: "Check log dates",
          explain: "Last period start is in the future — edit that log.",
        }
      : phaseForCycleDay(cycleDay, periodLen, cycleLen);

  return {
    logCount: sorted.length,
    avgCycleLength: avgCycle,
    avgPeriodLength: periodLen,
    lastStart: last.start_date,
    nextExpectedStart: nextExpected,
    daysUntilExpected: daysUntil,
    delayedDays,
    status,
    phase,
    phaseLabel: label,
    phaseExplain: explain,
    cycleDay: cycleDay >= 1 ? cycleDay : null,
    cycleLengths: lengths,
  };
}

/** Expand period start+duration into calendar dates */
export function expandPeriodDays(
  logs: PeriodLog[],
  fallbackDuration = DEFAULT_PERIOD,
): string[] {
  const days: string[] = [];
  for (const log of logs) {
    const dur = log.duration_days ?? fallbackDuration;
    for (let i = 0; i < dur; i++) {
      days.push(addDays(log.start_date, i));
    }
  }
  return days;
}

export function expandExpectedPeriodDays(
  nextStart: string | null,
  periodLen: number,
): string[] {
  if (!nextStart) return [];
  const days: string[] = [];
  for (let i = 0; i < periodLen; i++) days.push(addDays(nextStart, i));
  return days;
}

/** Map each day of current cycle (from last start through next expected) to a phase. */
export function expandPhaseDays(
  lastStart: string | null,
  periodLen: number,
  cycleLen: number,
): {
  menstrual: string[];
  follicular: string[];
  ovulation: string[];
  luteal: string[];
} {
  const empty = {
    menstrual: [] as string[],
    follicular: [] as string[],
    ovulation: [] as string[],
    luteal: [] as string[],
  };
  if (!lastStart || cycleLen < 1) return empty;

  for (let day = 1; day <= cycleLen; day++) {
    const ymd = addDays(lastStart, day - 1);
    const { phase } = phaseForCycleDay(day, periodLen, cycleLen);
    if (phase === "menstrual") empty.menstrual.push(ymd);
    else if (phase === "follicular") empty.follicular.push(ymd);
    else if (phase === "ovulation") empty.ovulation.push(ymd);
    else if (phase === "luteal") empty.luteal.push(ymd);
  }
  return empty;
}

export const PHASE_LEGEND: {
  phase: Exclude<CyclePhase, "unknown">;
  label: string;
  swatch: string;
}[] = [
  { phase: "menstrual", label: "Menstrual", swatch: "bg-rose-400" },
  { phase: "follicular", label: "Follicular", swatch: "bg-sky-400" },
  { phase: "ovulation", label: "Ovulation", swatch: "bg-amber-400" },
  { phase: "luteal", label: "Luteal", swatch: "bg-violet-400" },
];
