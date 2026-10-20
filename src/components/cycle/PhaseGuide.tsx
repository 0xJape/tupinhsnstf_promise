"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight, ChevronRight, HeartPulse, MessageCircle, Salad, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Promi } from "@/components/promi/Promi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { guidanceForPhase } from "@/lib/cycle/guidance";
import type { CyclePhase } from "@/lib/cycle/insights";
import { canSpeak, speakText, stopSpeaking } from "@/lib/ai/tts";

type Props = { phase: CyclePhase; cycleDay: number | null; open?: boolean; onOpenChange?: (open: boolean) => void; card?: boolean };

const prompts = [
  { label: "Food ideas", icon: Salad, text: "I am on an estimated {phase} phase, cycle day {day}. Give general education-only food ideas for today. Keep it short and do not prescribe." },
  { label: "What to notice", icon: HeartPulse, text: "I am on an estimated {phase} phase, cycle day {day}. What changes could I track today for my own cycle awareness? Keep it calm and non-diagnostic." },
  { label: "A gentle reset", icon: Sparkles, text: "I am on an estimated {phase} phase, cycle day {day}. Suggest one gentle, general wellbeing reset for today. No diagnosis or medical treatment." },
];

export function PhaseGuide({ phase, cycleDay, open: controlledOpen, onOpenChange, card = false }: Props) {
  const [localOpen, setLocalOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const ttsSupported = useSyncExternalStore(() => () => undefined, canSpeak, () => false);
  const guide = guidanceForPhase(phase);
  const open = controlledOpen ?? localOpen;
  const setOpen = onOpenChange ?? setLocalOpen;
  const phaseName = guide?.title.replace(" today", "") ?? "today";

  useEffect(() => () => stopSpeaking(), []);

  function toggleVoice(text: string) {
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    setSpeaking(true);
    void speakText(text, { rate: 0.95, onEnd: () => setSpeaking(false) });
  }

  async function ask(template: string) {
    setAsking(true);
    setAnswer("");
    try {
      const message = template.replace("{phase}", phaseName).replace("{day}", String(cycleDay ?? "unknown"));
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await response.json() as { assistantMessage?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Promi could not answer right now.");
      setAnswer(data.assistantMessage ?? "Promi could not answer right now.");
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : "Promi could not answer right now.");
    } finally { setAsking(false); }
  }

  if (!guide) return null;
  return <>
    {card ? <section className="cycle-guide-card rounded-3xl p-5"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary"><Sparkles className="size-5" /></span><div><p className="section-label text-primary">Today’s guide</p><h2 className="mt-1 text-lg font-semibold">{guide.title}</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{guide.body}</p></div></div><Button type="button" variant="outline" className="mt-4 min-h-11 w-full rounded-xl" onClick={() => setOpen(true)}>Open today’s guide<ChevronRight className="size-4" /></Button></section> : null}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="phase-guide-modal max-h-[min(44rem,calc(100dvh-2rem))] max-w-[calc(100%-2rem)] overflow-y-auto rounded-[2rem] border-primary/15 p-0 sm:max-w-md" showCloseButton>
        <div className="bg-gradient-to-br from-primary/12 via-background to-rose-100/70 p-5 dark:from-primary/20 dark:via-card dark:to-rose-950/30">
          <Promi emotion="care" size="md" variant="bare" hideName className="mx-auto -mb-7" />
          <DialogHeader className="relative rounded-3xl bg-background/90 p-5 text-center shadow-sm"><p className="section-label text-primary">{cycleDay ? `Cycle day ${cycleDay}` : "Today with Promi"}</p><DialogTitle className="mt-1 text-xl">{guide.title}</DialogTitle><DialogDescription className="mt-2 leading-relaxed">{guide.body}</DialogDescription><p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">Estimated from logged dates. Not fertility tracking or medical advice.</p></DialogHeader>
        </div>
        <div className="space-y-5 p-5">
          <div><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Try today</p>{ttsSupported ? <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={() => toggleVoice(`${guide.title}. ${guide.body}. Try today. ${guide.tips.join(". ")}. Notice, if useful. Energy, mood, sleep, pain, skin, or anything that affects your day. You choose what to log.`)}>{speaking ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}{speaking ? "Stop" : "Listen"}</Button> : null}</div><ul className="mt-3 space-y-2">{guide.tips.map((tip) => <li key={tip} className="flex gap-2 text-sm leading-relaxed text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{tip}</li>)}</ul></div>
          <div className="rounded-2xl bg-muted/65 p-4"><p className="text-sm font-semibold">Notice, if useful</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Energy, mood, sleep, pain, skin, or anything that affects your day. You choose what to log.</p></div>
          <div><div className="flex items-center gap-2"><MessageCircle className="size-4 text-primary" /><p className="text-sm font-semibold">Ask Promi about today</p></div><div className="mt-3 grid gap-2">{prompts.map(({ label, icon: Icon, text }) => <Button key={label} type="button" variant="outline" className="min-h-11 justify-between rounded-xl" disabled={asking} onClick={() => void ask(text)}>{label}<Icon className="size-4 text-primary" /></Button>)}</div>{asking ? <p className="mt-3 text-sm text-muted-foreground">Promi is thinking…</p> : null}{answer ? <div className="mt-3 space-y-3 rounded-2xl border border-primary/15 bg-primary/5 p-4"><p className="text-sm leading-relaxed text-foreground">{answer}</p>{ttsSupported ? <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => toggleVoice(answer)}>{speaking ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}{speaking ? "Stop voice" : "Listen to Promi"}</Button> : null}</div> : null}</div>
          <Button type="button" className="min-h-11 w-full rounded-xl" onClick={() => setOpen(false)}>I’ll choose what helps today<ArrowRight className="size-4" /></Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
