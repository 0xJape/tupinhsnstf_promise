"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

export function FeedbackSuccessModal() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation" onClick={() => router.replace("/feedback")}>
      <section role="dialog" aria-modal="true" aria-labelledby="feedback-success-title" className="surface-card w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <button type="button" aria-label="Close success message" onClick={() => router.replace("/feedback")} className="ml-auto flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <X className="size-5" aria-hidden />
        </button>
        <div className="mx-auto mt-1 flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-9" aria-hidden />
        </div>
        <h2 id="feedback-success-title" className="mt-5 font-display text-2xl font-bold">Feedback sent</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Thank you. Your feedback helps improve PROMISE.</p>
        <button type="button" onClick={() => router.replace("/feedback")} className="mt-6 min-h-11 w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Continue</button>
      </section>
    </div>
  );
}
