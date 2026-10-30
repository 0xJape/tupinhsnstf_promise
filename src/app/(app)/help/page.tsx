import Link from "next/link";
import { Phone, ExternalLink } from "lucide-react";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResourceDirectory } from "@/components/help/ResourceDirectory";

export default function HelpPage() {
  return (
    <div className="space-y-6 pb-4">
      <header className="relative overflow-hidden rounded-[28px] border border-rose-200/70 bg-[radial-gradient(circle_at_85%_10%,rgba(244,114,182,.28),transparent_34%),linear-gradient(135deg,rgba(255,246,250,.96),rgba(255,255,255,.8))] p-6 shadow-[0_20px_60px_rgba(157,23,77,.1)] dark:border-rose-400/20 dark:bg-[radial-gradient(circle_at_85%_10%,rgba(244,114,182,.2),transparent_34%),linear-gradient(135deg,rgba(63,20,45,.96),rgba(29,24,36,.9))] sm:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">PROMISE safety center</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">You do not have to handle this alone.</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Fast, clear next steps for urgent situations and emotional support. PROMISE provides education, not emergency care or diagnosis.
          </p>
        </div>
        <div className="absolute -right-8 -top-10 size-40 rounded-full border border-rose-300/40 bg-rose-300/10 blur-[1px]" aria-hidden />
        <div className="absolute right-10 top-8 size-3 rounded-full bg-rose-400 shadow-[0_0_24px_8px_rgba(244,114,182,.5)]" aria-hidden />
      </header>

      <DisclaimerBanner />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="surface-card space-y-2 border-primary/15 p-5 text-sm leading-relaxed">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Important boundary</p>
          <p className="text-muted-foreground">PROMISE helps you understand and record patterns. It does not diagnose, replace a clinician, or provide emergency care.</p>
        </div>
        <div className="surface-card space-y-2 border-amber-300/30 bg-amber-50/50 p-5 text-sm leading-relaxed dark:bg-amber-950/15">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Seek urgent care</p>
          <p className="text-muted-foreground">Severe pain, heavy bleeding, fainting, pregnancy concerns, trouble breathing, or immediate danger need urgent clinical help.</p>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[28px] border border-rose-300/50 bg-[linear-gradient(135deg,#fff1f5,#fff)] p-5 shadow-[0_18px_50px_rgba(225,29,72,.12)] dark:border-rose-300/20 dark:bg-[linear-gradient(135deg,rgba(80,20,40,.8),rgba(35,25,35,.9))] sm:p-6" aria-labelledby="urgent-help-heading">
        <div className="relative z-10 space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-300">Immediate support</p>
            <h2 id="urgent-help-heading" className="font-display text-2xl font-bold text-foreground">Need help right now?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            If you may be in immediate danger, call your local emergency number now. Do not wait for a response from PROMISE.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <a href="tel:911" className={cn(buttonVariants({ variant: "destructive" }), "h-12 rounded-2xl justify-center gap-2 shadow-lg shadow-rose-500/20")}>
            <Phone className="size-4" aria-hidden /> Call 911 (Philippines)
          </a>
          <a href="tel:1553" className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-2xl justify-center gap-2 border-rose-300/60 bg-white/70 dark:bg-black/10")}>
            <Phone className="size-4" aria-hidden /> Call 1553 (NCMH)
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          For urgent danger in the Philippines, call 911. For emotional crisis support, contact the National Center for Mental Health Crisis Hotline at 1553. If calling is unsafe, go to a trusted adult, nearby emergency department, or other safe person.
        </p>
        <a href="https://doh.gov.ph/health-advisory/mental-health-hotline" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline">
          Philippine DOH mental-health information <ExternalLink className="size-3.5" aria-hidden />
        </a>
        </div>
      </section>

      <section className="surface-card space-y-4 rounded-3xl p-5 sm:p-6" aria-labelledby="emotional-support-heading">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Emotional support</p>
          <h2 id="emotional-support-heading" className="mt-1 font-display text-2xl font-bold">Small steps for this moment</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use these only if they feel safe. They are not a substitute for urgent help.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <p className="font-semibold">1. Ground</p>
            <p className="mt-1 text-sm text-muted-foreground">Name five things you see, four you feel, and three you hear.</p>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <p className="font-semibold">2. Slow down</p>
            <p className="mt-1 text-sm text-muted-foreground">Unclench your jaw. Take one slow breath out longer than in.</p>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <p className="font-semibold">3. Connect</p>
            <p className="mt-1 text-sm text-muted-foreground">Message someone trusted: “I’m having a hard moment. Can you stay with me?”</p>
          </div>
        </div>
      </section>

      <ResourceDirectory />

      <Link
        href="/home"
        className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
      >
        Back to home
      </Link>
    </div>
  );
}
