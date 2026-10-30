"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Check, ClipboardList, HeartPulse, Sparkles, Stethoscope } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";

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
    <section className="dashboard-hud" aria-label="Today’s brief">
      <span className="dashboard-hud-grid" aria-hidden />
      <span className="dashboard-hud-corner dashboard-hud-corner-one" aria-hidden />
      <span className="dashboard-hud-corner dashboard-hud-corner-two" aria-hidden />

      <div className="dashboard-hud-copy">
        <p className="dashboard-hud-eyebrow">{greeting}{name ? `, ${name}` : ""}</p>
        <h1>Your next small step.</h1>
        <p className="dashboard-hud-cycle">{cycleLine}</p>
        <Link href={action.href} className="dashboard-hud-primary">
          {action.cta}<ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="dashboard-hud-reactor" aria-hidden="true">
        <span className="dashboard-hud-radar" />
        <span className="dashboard-hud-ring dashboard-hud-ring-one"><i /></span>
        <span className="dashboard-hud-ring dashboard-hud-ring-two"><i /></span>
        <span className="dashboard-hud-ring dashboard-hud-ring-three" />
        <span className="dashboard-hud-crosshair" />
        <span className="dashboard-hud-core"><BrandLogo className="dashboard-hud-logo" size={64} priority /></span>
      </div>

      <div className="dashboard-hud-mission">
        <div className="dashboard-hud-mission-head">
          <div><p>{action.label}</p><h2>{action.title}</h2></div>
          <span><ActionIcon className="size-5" aria-hidden /></span>
        </div>
        <ol aria-label="Recommended action steps">{steps.map((step, index) => <li key={step} className={index === 0 ? "is-complete" : ""}><span>{index === 0 ? <Check className="size-3" aria-hidden /> : index + 1}</span><b>{step}</b></li>)}</ol>
        <Link href={action.href} className="dashboard-hud-secondary">{action.cta}<ArrowRight className="size-3.5" aria-hidden /></Link>
      </div>

      <div className="dashboard-checkins" aria-label="What changed today?">
        <p className="col-span-full">What changed?</p>
        {checkIns.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className="dashboard-checkin"><Icon className="size-4 text-primary" aria-hidden />{label}</Link>)}
      </div>
    </section>
  );
}
