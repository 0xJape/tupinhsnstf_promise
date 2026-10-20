"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { saveDailyWellnessLog } from "@/app/(app)/track/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  ["Pain", "How much pain are you feeling today?", "pain_level", 0, 10],
  ["Fatigue", "How tired do you feel today?", "fatigue_level", 0, 10],
  ["Sleep", "How many hours did you sleep?", "sleep_hours", 0, 24],
  ["Activity", "How many minutes were you active?", "activity_minutes", 0, 1440],
  ["Stress", "How stressed do you feel today?", "stress_level", 1, 5],
] as const;

type Props = { today: string };

export function DailyWellnessForm({ today }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const current = steps[step];
  const isNotes = step === steps.length + 2;
  const isMood = step === steps.length;
  const isAcne = step === steps.length + 1;

  return (
    <form action={saveDailyWellnessLog} onSubmit={(event) => { if (!isNotes) event.preventDefault(); }} className="surface-card space-y-5 rounded-3xl p-5">
      <input type="hidden" name="log_date" value={today} />
      {steps.map(([, , name]) => <input key={name} type="hidden" name={name} value={answers[name] ?? ""} />)}
      <input type="hidden" name="mood" value={answers.mood ?? ""} />
      <input type="hidden" name="acne_change" value={answers.acne_change ?? ""} />
      <input type="hidden" name="notes" value={answers.notes ?? ""} />
      <div className="flex items-center justify-between gap-3">
        <p className="section-label text-primary">Daily check-in</p>
        <p className="text-xs font-medium text-muted-foreground">{step + 1} / {steps.length + 3}</p>
      </div>

      {current ? (
        <div className="space-y-3">
          <Label htmlFor={current[2]} className="text-lg font-semibold text-foreground">{current[1]}</Label>
          <Input id={current[2]} type="number" min={current[3]} max={current[4]} step={current[2] === "sleep_hours" ? "0.5" : "1"} value={answers[current[2]] ?? ""} onChange={(event) => setAnswers({ ...answers, [current[2]]: event.target.value })} placeholder={`Optional · ${current[3]}–${current[4]}`} className="min-h-14 rounded-xl text-lg" autoFocus />
          <p className="text-xs text-muted-foreground">Optional. Leave blank if you do not want to track this.</p>
        </div>
      ) : isMood ? (
        <Choices label="How is your mood today?" name="mood" options={["low", "okay", "good"]} value={answers.mood} onChange={(value) => setAnswers({ ...answers, mood: value })} />
      ) : isAcne ? (
        <Choices label="Any acne change today?" name="acne_change" options={["none", "mild", "moderate", "severe"]} value={answers.acne_change} onChange={(value) => setAnswers({ ...answers, acne_change: value })} />
      ) : isNotes ? (
        <div className="space-y-3"><Label htmlFor="notes" className="text-lg font-semibold text-foreground">Anything else to note?</Label><Textarea id="notes" maxLength={500} value={answers.notes ?? ""} onChange={(event) => setAnswers({ ...answers, notes: event.target.value })} placeholder="Optional symptoms, food, medication, or context." className="min-h-32 rounded-xl" autoFocus /><p className="text-xs text-muted-foreground">Optional. Keep private notes short.</p></div>
      ) : null}

      <div className="flex gap-2">
        {step ? <Button type="button" variant="outline" className="min-h-11 flex-1 rounded-xl" onClick={() => setStep(step - 1)}><ArrowLeft className="size-4" aria-hidden />Back</Button> : null}
        {isNotes ? <SubmitButton pendingLabel="Saving…" size="lg" className="min-h-11 flex-1 rounded-xl">Save check-in</SubmitButton> : <Button type="button" size="lg" className="min-h-11 flex-1 rounded-xl" onClick={() => setStep(step + 1)}>Next<ArrowRight className="size-4" aria-hidden /></Button>}
      </div>
    </form>
  );
}

function Choices({ label, name, options, value, onChange }: { label: string; name: string; options: readonly string[]; value?: string; onChange: (value: string) => void }) {
  return <div className="space-y-3"><Label className="text-lg font-semibold text-foreground">{label}</Label><div className="grid gap-2">{options.map((option) => <label key={option} className="flex min-h-12 items-center gap-3 rounded-xl border border-input px-4 text-sm font-medium capitalize"><input type="radio" name={`${name}-choice`} value={option} checked={value === option} onChange={() => onChange(option)} className="size-4 accent-primary" />{option}</label>)}</div><p className="text-xs text-muted-foreground">Optional. Choose one, or continue.</p></div>;
}
