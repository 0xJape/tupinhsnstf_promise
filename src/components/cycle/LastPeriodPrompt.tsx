"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { Promi } from "@/components/promi/Promi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = { open: boolean; onDismiss: () => void };

function today() { return new Date().toLocaleDateString("en-CA"); }

export function LastPeriodPrompt({ open, onDismiss }: Props) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  function continueToLog() {
    if (!date) { setError("Choose date when your latest period began."); return; }
    router.push(`/cycle/new?guided=1&date=${date}`);
  }

  return <Dialog open={open} onOpenChange={(value) => !value && onDismiss()}>
    <DialogContent className="max-w-[calc(100%-2rem)] overflow-hidden rounded-[2rem] border-primary/15 p-0 sm:max-w-md" showCloseButton>
      <div className="bg-gradient-to-br from-primary/12 via-background to-rose-100/70 p-5 dark:from-primary/20 dark:via-card dark:to-rose-950/30">
        <Promi emotion="wave" size="md" variant="bare" hideName className="mx-auto -mb-7" />
        <DialogHeader className="relative rounded-3xl bg-background/90 p-5 text-center shadow-sm"><span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><CalendarDays className="size-5" /></span><DialogTitle className="text-xl">When did your latest period begin?</DialogTitle><DialogDescription className="mt-2 leading-relaxed">Choose first day of bleeding. We will prefill your log — you can add only what you remember.</DialogDescription></DialogHeader>
      </div>
      <div className="space-y-3 p-5"><div className="space-y-2"><Label htmlFor="latest-period-date">Latest period start</Label><Input id="latest-period-date" type="date" max={today()} value={date} onChange={(event) => { setDate(event.target.value); setError(""); }} className="min-h-12 rounded-xl" autoFocus /></div>{error ? <p className="text-sm text-destructive">{error}</p> : null}<p className="text-xs leading-relaxed text-muted-foreground">Not sure? Pick your best estimate. You can correct it later.</p><div className="rounded-2xl border border-primary/15 bg-primary/5 p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">What this unlocks</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">First date starts your cycle picture. Logging another real period start next cycle unlocks more personal phase estimates and suggestions.</p></div><div className="flex gap-3"><Button type="button" variant="ghost" className="min-h-11 flex-1 rounded-xl" onClick={onDismiss}>Not now</Button><Button type="button" className="min-h-11 flex-[1.4] rounded-xl" onClick={continueToLog}>Continue<ArrowRight className="size-4" /></Button></div></div>
    </DialogContent>
  </Dialog>;
}
