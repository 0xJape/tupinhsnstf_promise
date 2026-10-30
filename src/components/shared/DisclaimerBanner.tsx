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
        "relative flex items-start gap-3 overflow-hidden rounded-2xl border border-[#e9c9a7] bg-[#fffaf3] px-4 py-3 text-sm font-medium text-[#5a3828] shadow-[0_8px_24px_rgba(113,67,38,0.08)] dark:border-amber-300/20 dark:bg-[#291b19] dark:text-amber-50/90 dark:shadow-[0_8px_24px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      <ShieldAlert
        className="mt-0.5 size-4 shrink-0 rounded-full bg-[#f3d7b9] p-0.5 text-[#8d4e2b] dark:bg-amber-300/15 dark:text-amber-200"
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
