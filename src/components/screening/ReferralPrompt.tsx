"use client";

import { useState } from "react";
import { CheckCircle2, MessageCircle, Stethoscope } from "lucide-react";
import { SeekCareReferral } from "@/components/screening/SeekCareReferral";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { REFERRAL_CHECKLIST, VISIT_QUESTIONS } from "@/lib/screening/content";

export function ReferralPrompt({ assessmentId, initialOpen }: { assessmentId: string; initialOpen: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return <>
    <Button type="button" className="w-full rounded-2xl bg-amber-800 text-white hover:bg-amber-900" onClick={() => setOpen(true)}><Stethoscope className="size-4" />Review referral support</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90dvh] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-[2rem] p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border bg-amber-50 p-5 text-left dark:bg-amber-950/40"><span className="flex size-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"><Stethoscope className="size-5" /></span><DialogTitle className="mt-3">Talk to a professional</DialogTitle><DialogDescription>Moderate and High screening results include referral support. This remains your choice; nothing is sent until you consent and submit.</DialogDescription></DialogHeader>
        <div className="space-y-5 p-5">
          <section><h3 className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="size-4 text-primary" />Prepare for your visit</h3><ul className="mt-3 space-y-2">{REFERRAL_CHECKLIST.map((item) => <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{item}</li>)}</ul></section>
          <section><h3 className="flex items-center gap-2 text-sm font-semibold"><MessageCircle className="size-4 text-primary" />Questions you can ask</h3><ol className="mt-3 space-y-2">{VISIT_QUESTIONS.map((item, index) => <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted-foreground"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>{item}</li>)}</ol></section>
          <div className="overflow-hidden rounded-2xl border border-amber-200/60 bg-amber-50/70 dark:border-amber-700/40 dark:bg-amber-950/30"><SeekCareReferral assessmentId={assessmentId} /></div>
          <Button type="button" variant="ghost" className="w-full rounded-xl" onClick={() => setOpen(false)}>Think about it</Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}