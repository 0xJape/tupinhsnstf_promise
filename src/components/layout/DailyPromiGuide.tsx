"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Bell, CheckCircle2, ClipboardList, Droplets, X } from "lucide-react";
import { Promi } from "@/components/promi/Promi";
import { PhaseGuide } from "@/components/cycle/PhaseGuide";
import { LastPeriodPrompt } from "@/components/cycle/LastPeriodPrompt";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CycleInsights } from "@/lib/cycle/insights";

type Props = {
  userId: string;
  today: string;
  hasCheckIn: boolean;
  insights: Pick<CycleInsights, "cycleDay" | "logCount" | "phase" | "phaseLabel" | "status" | "nextExpectedStart">;
};

function nextAction(insights: Props["insights"], hasCheckIn: boolean) {
  if (insights.status === "period_window" || insights.status === "delayed") {
    return {
      title: insights.status === "delayed" ? "No period start logged yet" : "Your estimated period window is here",
      body: insights.status === "delayed" ? "Your period estimate has passed, but cycles can shift. If bleeding began, log its first day. If not, be gentle with yourself and note any changes that feel useful." : "Your estimated period window is here. If bleeding began, log its first day. Comfort, rest, warmth, and hydration may help if they feel good to you.",
      href: "/cycle/new?guided=1",
      cta: "Log a period start",
      icon: Droplets,
      emotion: "care" as const,
      unlock: "Log a new start only when bleeding begins. This closes the overdue prompt and starts your next cycle view.",
    };
  }
  if (hasCheckIn) {
    return {
      title: "Today’s check-in is complete",
      body: "You already filled out today’s check-in. Your entry is saved; come back tomorrow or review your cycle guide now.",
      href: "/track",
      cta: "View today’s entry",
      icon: CheckCircle2,
      emotion: "wave" as const,
      unlock: "Tomorrow unlocks a new check-in. Two or more period starts unlock phase-based suggestions.",
    };
  }
  if (!insights.logCount) {
    return {
      title: "Build your cycle picture",
      body: "Start with one date. More logged starts make future estimates more personal.",
      href: "/cycle/new?guided=1",
      cta: "Add a cycle date",
      icon: Droplets,
      emotion: "wave" as const,
      unlock: "Add your latest period start now. Add another start next cycle to unlock personal phase estimates and suggestions.",
    };
  }
  return {
    title: insights.cycleDay ? `Cycle day ${insights.cycleDay}` : "A small check-in",
    body: insights.logCount >= 2 ? `${insights.phaseLabel} is an estimate from your logged dates. Notice what feels useful today.` : "A daily note can help you notice patterns over time.",
    href: "/track?guided=1",
    cta: "Check in today",
    icon: ClipboardList,
    emotion: "think" as const,
    unlock: insights.logCount < 2 ? "Log your next period start when it happens to unlock phase-based suggestions." : "Complete today’s check-in to add today to your pattern reflection.",
  };
}

export function DailyPromiGuide({ hasCheckIn, insights }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const guided = params.get("guided") === "1";
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const action = nextAction(insights, hasCheckIn);

  useEffect(() => {
    const isEntryForm = pathname === "/track" || pathname === "/cycle/new";
    const periodDue = insights.status === "period_window" || insights.status === "delayed";
    const alertKey = `promise:period-alert:${insights.nextExpectedStart ?? "unknown"}`;
    const unseenPeriodAlert = periodDue && !sessionStorage.getItem(alertKey);
    const shouldOpen = (guided && isEntryForm) || (!isEntryForm && unseenPeriodAlert);
    if (unseenPeriodAlert) sessionStorage.setItem(alertKey, "1");
    const frame = requestAnimationFrame(() => {
      setOpen(shouldOpen);
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [guided, insights.nextExpectedStart, insights.status, pathname]);

  if (!ready) return null;
  const isHandoff = guided && (pathname === "/track" || pathname === "/cycle/new");
  const handoff = pathname === "/cycle/new"
    ? { title: "Your latest date is ready", body: "Confirm it, then add any details you remember. Everything else is optional.", cta: "Start my log", emotion: "care" as const }
    : hasCheckIn
      ? { title: "You already checked in today", body: "Your entry is saved. No need to fill it out again; come back tomorrow.", cta: "View my entry", emotion: "wave" as const }
      : { title: "There is no perfect check-in", body: "Answer only what feels useful. You can skip any question.", cta: "Start my check-in", emotion: "wave" as const };
  const content = isHandoff ? handoff : action;
  const Icon = isHandoff ? CheckCircle2 : action.icon;

  function dismiss() {
    setOpen(false);
    if (guided) router.replace(pathname);
  }

  function continueGuide() {
    if (isHandoff) dismiss();
    else router.push(action.href);
  }

  const showPhaseGuide = !guided && insights.logCount >= 2 && insights.phase !== "unknown" && insights.status === "on_track";
  if (showPhaseGuide) {
    return <><GuideTrigger label={`${insights.phaseLabel} suggestions`} onClick={() => setOpen(true)} /><PhaseGuide phase={insights.phase} cycleDay={insights.cycleDay} open={open} onOpenChange={setOpen} /></>;
  }
  if (!guided && !insights.logCount) {
    return <><GuideTrigger label="Add your latest period date" onClick={() => setOpen(true)} /><LastPeriodPrompt open={open} onDismiss={() => setOpen(false)} /></>;
  }

  return (
    <><GuideTrigger label={action.title} onClick={() => setOpen(true)} hidden={guided} /><Dialog open={open} onOpenChange={(value) => !value && dismiss()}>
      <DialogContent className="daily-promi-guide max-w-[calc(100%-2rem)] overflow-hidden rounded-[2rem] border-primary/15 p-0 sm:max-w-md" showCloseButton>
        <div className="bg-gradient-to-br from-primary/12 via-background to-rose-100/70 p-5 dark:from-primary/20 dark:via-card dark:to-rose-950/30">
          <Promi emotion={content.emotion} size="md" variant="bare" hideName className="mx-auto -mb-7" />
          <DialogHeader className="relative rounded-3xl bg-background/90 p-5 text-center shadow-sm">
            <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Icon className="size-5" /></span>
            <DialogTitle className="text-xl">{content.title}</DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-xs leading-relaxed">{content.body}</DialogDescription>
            {!isHandoff ? <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">Educational support only. Cycle estimates are not fertility tracking or medical advice.</p> : null}
          </DialogHeader>
        </div>
        {!isHandoff ? <div className="mx-5 rounded-2xl border border-primary/15 bg-primary/5 p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">What unlocks next</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{action.unlock}</p></div> : null}
        <div className="flex gap-3 px-5 pb-5">
          <Button type="button" variant="ghost" className="min-h-11 flex-1 rounded-xl" onClick={dismiss}>Not now</Button>
          <Button type="button" className="min-h-11 flex-[1.4] rounded-xl" onClick={continueGuide}>{content.cta}<ArrowRight className="size-4" /></Button>
        </div>
      </DialogContent>
    </Dialog></>
  );
}

function GuideTrigger({ label, onClick, hidden = false }: { label: string; onClick: () => void; hidden?: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  if (hidden || dismissed) return null;
  return <div className="mx-auto mb-2 w-full max-w-lg px-1"><div className="relative overflow-hidden rounded-2xl border border-primary/45 bg-primary text-primary-foreground shadow-[0_0_22px_-4px_hsl(var(--primary)/0.75)] before:pointer-events-none before:absolute before:inset-0 before:animate-pulse before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent"><button type="button" onClick={onClick} className="relative flex min-h-12 w-full items-center gap-3 py-2 pl-3 pr-12 text-left" aria-label={`Open Promi guide: ${label}`}><span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/15"><Bell className="size-4" /></span><span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-[0.14em] opacity-75">Promi guide</span><span className="block truncate text-sm font-semibold">{label}</span></span><ArrowRight className="ml-auto size-4 shrink-0" /></button><button type="button" onClick={() => setDismissed(true)} className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-xl text-primary-foreground/80 hover:bg-white/15 hover:text-primary-foreground" aria-label="Dismiss Promi guide notification"><X className="size-4" /></button></div></div>;
}
