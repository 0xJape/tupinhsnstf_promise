"use client";

import { saveSymptomRecord } from "@/app/(app)/track/symptom-actions";
import { SubmitButton } from "@/components/ui/submit-button";

export function SymptomRecordForm({ today }: { today: string }) {
  return <form action={saveSymptomRecord} className="surface-card grid gap-3 rounded-3xl p-5 sm:grid-cols-2">
    <label className="grid gap-1 text-sm font-medium">Symptom<input name="symptom" required maxLength={80} placeholder="Acne, fatigue, bloating…" className="min-h-11 rounded-xl border border-input bg-background px-3" /></label>
    <label className="grid gap-1 text-sm font-medium">Body area<input name="body_area" required maxLength={80} placeholder="Face, abdomen, whole body…" className="min-h-11 rounded-xl border border-input bg-background px-3" /></label>
    <label className="grid gap-1 text-sm font-medium">Date<input name="occurred_on" type="date" defaultValue={today} required className="min-h-11 rounded-xl border border-input bg-background px-3" /></label>
    <label className="grid gap-1 text-sm font-medium">Severity (1–5)<input name="severity" type="number" min="1" max="5" defaultValue="1" required className="min-h-11 rounded-xl border border-input bg-background px-3" /></label>
    <label className="grid gap-1 text-sm font-medium">Frequency<select name="frequency" defaultValue="once" className="min-h-11 rounded-xl border border-input bg-background px-3"><option value="once">Once</option><option value="occasional">Occasional</option><option value="frequent">Frequent</option><option value="constant">Constant</option></select></label>
    <label className="grid gap-1 text-sm font-medium">Change<select name="change" defaultValue="same" className="min-h-11 rounded-xl border border-input bg-background px-3"><option value="improved">Improved</option><option value="same">Same</option><option value="worsened">Worsened</option></select></label>
    <label className="grid gap-1 text-sm font-medium">Duration<input name="duration" maxLength={80} placeholder="A few hours, 3 days…" className="min-h-11 rounded-xl border border-input bg-background px-3" /></label>
    <label className="grid gap-1 text-sm font-medium sm:col-span-2">Notes<textarea name="notes" maxLength={500} placeholder="Optional personal note" className="min-h-20 rounded-xl border border-input bg-background px-3 py-2" /></label>
    <SubmitButton pendingLabel="Saving…" className="min-h-11 rounded-xl sm:col-span-2">Save symptom</SubmitButton>
  </form>;
}
