import { Sparkles } from "lucide-react";
import { guidanceForPhase } from "@/lib/cycle/guidance";
import type { CycleInsights } from "@/lib/cycle/insights";

type Props = { insights: CycleInsights };

export function PhaseGuidanceCard({ insights }: Props) {
  const guidance = guidanceForPhase(insights.phase);
  if (!guidance || insights.logCount < 2 || insights.status === "need_more") {
    return null;
  }

  return (
    <section className="glass-strong rounded-[28px] p-5" aria-label="Phase guidance">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div>
          <p className="section-label text-primary">Estimated {insights.phaseLabel.replace(" phase", "")} phase</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{guidance.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{guidance.body}</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
        {guidance.tips.map((tip) => (
          <li key={tip} className="surface-card rounded-xl px-3 py-2 text-xs font-medium leading-relaxed text-foreground">
            {tip}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Educational estimate from period dates only. Not fertility tracking, contraception, or medical advice.
      </p>
    </section>
  );
}
