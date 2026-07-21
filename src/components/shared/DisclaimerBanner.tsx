import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  compact?: boolean;
};

export function DisclaimerBanner({ className, compact }: Props) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-[24px] border border-amber-500/20 bg-[rgba(255,251,235,0.75)] px-4 py-3.5 text-sm font-medium text-amber-950 shadow-[10px_10px_22px_rgba(160,150,180,0.12)] backdrop-blur-xl dark:border-amber-400/15 dark:bg-amber-500/8 dark:text-amber-50/95 dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      <ShieldAlert
        className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300"
        aria-hidden
      />
      {compact ? (
        <p className="leading-relaxed">
          <strong>Not a diagnosis.</strong> Educational screening only — not a
          substitute for clinical care.
        </p>
      ) : (
        <p className="leading-relaxed">
          <strong>Not a medical diagnosis tool.</strong> Results are educational
          risk screening only. Only a qualified clinician can evaluate PCOS.
          Seek urgent care for severe pain, heavy bleeding, pregnancy concerns,
          or emergency symptoms.
        </p>
      )}
    </div>
  );
}
