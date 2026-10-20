"use client";

import { useState } from "react";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Promi } from "@/components/promi/Promi";

type Props = { cycleLogCount: number; dailyLogCount: number };

export function PatternSummary({ cycleLogCount, dailyLogCount }: Props) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [pending, setPending] = useState(false);

  async function createSummary() {
    setPending(true);
    setSummary("");
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ includeDailyPatterns: true, message: "Create a short educational pattern reflection from my period logs and daily self-reports. Clearly separate what I logged from what is uncertain. Mention no diagnosis, no treatment, and no causal claims. Give 2–3 practical questions I could track or discuss with a trusted clinician if symptoms affect my life." }) });
      const data = await response.json() as { assistantMessage?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Promi could not create a summary right now.");
      setSummary(data.assistantMessage ?? "Promi could not create a summary right now.");
    } catch (error) { setSummary(error instanceof Error ? error.message : "Promi could not create a summary right now."); }
    finally { setPending(false); }
  }

  return <><section className="cycle-guide-card rounded-3xl p-5"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary"><Brain className="size-5" /></span><div><p className="section-label text-primary">Your notes, connected</p><h2 className="mt-1 text-lg font-semibold">Reflect on your patterns</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Promi can summarize {cycleLogCount} cycle log{cycleLogCount === 1 ? "" : "s"} and {dailyLogCount} recent check-in{dailyLogCount === 1 ? "" : "s"} when you choose.</p></div></div><Button type="button" variant="outline" className="mt-4 min-h-11 w-full rounded-xl" onClick={() => setOpen(true)}>Review my patterns<Sparkles className="size-4" /></Button></section><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[min(42rem,calc(100dvh-2rem))] max-w-[calc(100%-2rem)] overflow-y-auto rounded-[2rem] border-primary/15 p-0 sm:max-w-md" showCloseButton><div className="bg-gradient-to-br from-primary/12 via-background to-rose-100/70 p-5 dark:from-primary/20 dark:via-card dark:to-rose-950/30"><Promi emotion="think" size="md" variant="bare" hideName className="mx-auto -mb-7" /><DialogHeader className="relative rounded-3xl bg-background/90 p-5 text-center shadow-sm"><DialogTitle className="text-xl">Reflect on your patterns</DialogTitle><DialogDescription className="mt-2 leading-relaxed">Promi will read your recent cycle logs and private daily entries, including notes, only for this summary.</DialogDescription></DialogHeader></div><div className="space-y-4 p-5">{!summary ? <><p className="rounded-2xl bg-muted/65 p-4 text-sm leading-relaxed text-muted-foreground">This is a reflection of self-reported information, not a diagnosis, score, or clinical conclusion.</p><Button type="button" className="min-h-11 w-full rounded-xl" disabled={pending || (!cycleLogCount && !dailyLogCount)} onClick={() => void createSummary()}>{pending ? <><Loader2 className="size-4 animate-spin" />Promi is reflecting…</> : "Create my reflection"}</Button>{!cycleLogCount && !dailyLogCount ? <p className="text-center text-sm text-muted-foreground">Add a cycle date or check-in first.</p> : null}</> : <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">{summary}</div>}</div></DialogContent></Dialog></>;
}
