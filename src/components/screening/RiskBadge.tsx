import { cn } from "@/lib/utils";
import type { RiskCategory } from "@/types/screening";

const tone: Record<RiskCategory, string> = {
  Low: "border border-emerald-500/20 bg-emerald-50/90 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:shadow-none",
  Moderate:
    "border border-amber-500/20 bg-amber-50/90 text-amber-950 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100 dark:shadow-none",
  High: "border border-rose-500/20 bg-rose-50/90 text-rose-950 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-100 dark:shadow-none",
};

const dot: Record<RiskCategory, string> = {
  Low: "bg-emerald-500",
  Moderate: "bg-amber-500",
  High: "bg-rose-500",
};

type Props = {
  category: RiskCategory;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function RiskBadge({ category, size = "md", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-0 font-bold tracking-tight",
        tone[category],
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-sm",
        size === "lg" && "px-3 py-1.5 text-base",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", dot[category])}
      />
      {category} risk
    </span>
  );
}
