"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Check, ClipboardList, HeartPulse, Sparkles, Stethoscope } from "lucide-react";
import { Promi } from "@/components/promi/Promi";

type CheckIn = {
  label: string;
  href: string;
  icon: typeof CalendarDays;
};

type Props = {
  greeting: string;
  name: string | null;
  cycleLine: string;
  action: { label: string; title: string; body: string; href: string; cta: string };
  actionKind: "care" | "screen" | "cycle";
};

const checkIns: CheckIn[] = [
  { label: "Cycle changed", href: "/cycle/new", icon: CalendarDays },
  { label: "Skin / hair concern", href: "/track", icon: HeartPulse },
  { label: "Energy / mood", href: "/track", icon: Sparkles },
  { label: "Continue screening", href: "/screen/quiz", icon: ClipboardList },
];

export function DailyBrief({ greeting, name, cycleLine, action, actionKind }: Props) {
  const ActionIcon = actionKind === "care" ? Stethoscope : actionKind === "screen" ? ClipboardList : CalendarDays;
  const steps = actionKind === "care" ? ["Screen saved", "Prepare questions", "Talk with a clinician"] : actionKind === "screen" ? ["Read how it works", "Answer at your pace", "Save your context"] : ["Add a start date", "Build your history", "See estimates"];
  return (
    <section className="dashboard-brief" aria-label="Today’s brief">
      <div className="dashboard-brief-copy">
        <p className="section-label text-primary">{greeting}{name ? `, ${name}` : ""}</p>
        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Your next small step.</h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{cycleLine}. Education and estimates only — not a diagnosis.</p>
        <Link href={action.href} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          {action.cta}<ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="dashboard-brief-action">
        <div className="flex items-start justify-between gap-3"><div><p className="section-label text-primary">{action.label}</p><p className="mt-1 font-display text-lg font-extrabold tracking-tight text-foreground">{action.title}</p></div><span className="dashboard-action-icon"><ActionIcon className="size-5" aria-hidden /></span></div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{action.body}</p>
        <ol className="dashboard-action-route" aria-label="Recommended action steps">{steps.map((step, index) => <li key={step} className={index === 0 ? "is-complete" : ""}><span>{index === 0 ? <Check className="size-3" aria-hidden /> : index + 1}</span>{step}</li>)}</ol>
        <div className="mt-3 flex items-center justify-between gap-3"><Promi emotion={actionKind === "care" ? "care" : "wave"} size="sm" variant="bare" className="dashboard-action-promi" hideName /><Link href={action.href} className="dashboard-action-link">{action.cta}<ArrowRight className="size-3.5" aria-hidden /></Link></div>
      </div>
      <div className="dashboard-checkins" aria-label="What changed today?">
        <p className="section-label col-span-full">What changed?</p>
        {checkIns.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className="dashboard-checkin"><Icon className="size-4 text-primary" aria-hidden />{label}</Link>)}
      </div>
    </section>
  );
}
