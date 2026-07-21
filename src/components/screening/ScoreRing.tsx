import { cn } from "@/lib/utils";
import type { RiskCategory } from "@/types/screening";

const stroke: Record<RiskCategory, string> = {
  Low: "stroke-emerald-500",
  Moderate: "stroke-amber-500",
  High: "stroke-rose-500",
};

const track: Record<RiskCategory, string> = {
  Low: "stroke-emerald-500/15",
  Moderate: "stroke-amber-500/15",
  High: "stroke-rose-500/15",
};

const glow: Record<RiskCategory, string> = {
  Low: "shadow-[0_0_40px_oklch(0.7_0.14_155/0.35)]",
  Moderate: "shadow-[0_0_40px_oklch(0.75_0.14_75/0.35)]",
  High: "shadow-[0_0_40px_oklch(0.65_0.16_15/0.35)]",
};

const labelTone: Record<RiskCategory, string> = {
  Low: "text-emerald-800",
  Moderate: "text-amber-900",
  High: "text-rose-900",
};

type Props = {
  score: number;
  maxScore: number;
  category: RiskCategory;
  className?: string;
};

export function ScoreRing({ score, maxScore, category, className }: Props) {
  const safeMax = maxScore > 0 ? maxScore : 1;
  const clamped = Math.min(Math.max(score, 0), safeMax);
  const pct = Math.round((clamped / safeMax) * 100);

  const size = 188;
  const strokeWidth = 14;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / safeMax);

  return (
    <div
      className={cn(
        "relative mx-auto flex size-[188px] items-center justify-center",
        className,
      )}
      role="img"
      aria-label={`Score ${score} of ${maxScore}, ${pct} percent, ${category} risk`}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-2 rounded-full glass-strong",
          glow[category],
        )}
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className={track[category]}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className={stroke[category]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p
          className={cn(
            "text-4xl font-semibold tracking-tight tabular-nums",
            labelTone[category],
          )}
        >
          {pct}
          <span className="text-lg font-semibold opacity-60">%</span>
        </p>
        <p className="mt-0.5 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          {score}/{maxScore}
        </p>
      </div>
    </div>
  );
}
