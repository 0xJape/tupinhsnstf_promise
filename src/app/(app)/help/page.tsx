import Link from "next/link";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HelpPage() {
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Help</h1>
        <p className="text-sm text-muted-foreground">
          Safety first. This is education, not care.
        </p>
      </header>

      <DisclaimerBanner />

      <div className="surface-card space-y-3 p-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Who it&apos;s for:</strong> ages
          12–24 (female).
        </p>
        <p>
          <strong className="text-foreground">Emergency:</strong> severe pain,
          heavy bleeding, fainting, pregnancy concerns — seek urgent clinical
          care, do not wait on this app.
        </p>
      </div>

      <Link
        href="/home"
        className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
      >
        Back to home
      </Link>
    </div>
  );
}
