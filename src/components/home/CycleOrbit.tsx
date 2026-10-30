import type { CycleInsights } from "@/lib/cycle/insights";

type Props = { insights: CycleInsights };

const phaseColors: Record<CycleInsights["phase"], string> = {
  menstrual: "#c94a68",
  follicular: "#b18a5a",
  ovulation: "#9f2947",
  luteal: "#7d5670",
  unknown: "#b9aab0",
};

export function CycleOrbit({ insights }: Props) {
  const cycleLength = insights.avgCycleLength ?? 28;
  const day = insights.cycleDay ?? 0;
  const progress = day ? Math.min(1, day / cycleLength) : 0;
  const circumference = 2 * Math.PI * 44;
  const dash = circumference * progress;
  const color = phaseColors[insights.phase];

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-32 shrink-0" role="img" aria-label={day ? `Cycle day ${day} of approximately ${cycleLength}` : "No cycle data yet"}>
        <svg viewBox="0 0 104 104" className="size-full -rotate-90">
          <circle cx="52" cy="52" r="44" fill="none" stroke="currentColor" strokeOpacity=".1" strokeWidth="9" />
          <circle cx="52" cy="52" r="44" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`} />
          <circle cx="52" cy="52" r="34" fill="none" stroke={color} strokeOpacity=".16" strokeWidth="1" strokeDasharray="2 5" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-2xl font-bold text-foreground">{day || "—"}</span>
          <span className="text-[10px] text-muted-foreground">cycle day</span>
        </div>
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-foreground">{insights.phaseLabel}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{insights.phaseExplain}</p>
        <p className="text-xs font-medium text-primary">{insights.daysUntilExpected != null ? `${Math.max(0, insights.daysUntilExpected)}d until expected period` : "Log periods to build your orbit"}</p>
      </div>
    </div>
  );
}
