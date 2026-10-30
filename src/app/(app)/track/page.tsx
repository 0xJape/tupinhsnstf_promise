import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, PhoneCall, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteDailyWellnessLog } from "@/app/(app)/track/actions";
import { saveSafetyCheckin } from "@/app/(app)/track/safety-actions";
import { DailyWellnessForm } from "@/components/tracking/DailyWellnessForm";
import { SymptomRecordForm } from "@/components/tracking/SymptomRecordForm";
import { deleteSymptomRecord, updateSymptomRecord } from "@/app/(app)/track/symptom-actions";
import { deleteClinicianQuestion, saveClinicianQuestion } from "@/app/(app)/track/question-actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const today = new Date().toLocaleDateString("en-CA");

type Props = { searchParams: Promise<{ saved?: string; symptom_saved?: string; question_saved?: string; error?: string; already?: string; safety?: "safe" | "need_support" }> };

export default async function TrackPage({ searchParams }: Props) {
  const { saved, symptom_saved, question_saved, error, already, safety } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("emergency_contact_name, emergency_contact_phone")
    .eq("id", user.id)
    .maybeSingle();

  const { data: logs } = await supabase
    .from("daily_wellness_logs")
    .select("id, log_date, pain_level, fatigue_level, mood, acne_change, sleep_hours, activity_minutes, stress_level, notes")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(14);
  const todayEntry = logs?.find((log) => log.log_date === today);
  const { data: symptoms } = await supabase
    .from("symptom_records")
    .select("id, symptom, body_area, occurred_on, severity, frequency, duration, change, notes")
    .eq("user_id", user.id)
    .order("occurred_on", { ascending: false })
    .limit(30);
  const { data: questions } = await supabase
    .from("clinician_questions")
    .select("id, question")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6 pb-4">
      <header className="relative overflow-hidden rounded-[28px] border border-primary/20 bg-[radial-gradient(circle_at_88%_12%,rgba(244,114,182,.3),transparent_32%),linear-gradient(135deg,rgba(255,247,251,.98),rgba(255,255,255,.75))] p-6 shadow-[0_20px_60px_rgba(159,41,71,.1)] dark:bg-[radial-gradient(circle_at_88%_12%,rgba(244,114,182,.2),transparent_32%),linear-gradient(135deg,rgba(63,20,45,.96),rgba(29,24,36,.9))] sm:p-8">
        <div className="relative z-10 max-w-2xl"><div className="flex items-center gap-2"><span className="size-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_12px_3px_rgba(16,185,129,.35)]" /><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">PROMISE personal signal // active</p></div><h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Track how you feel</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">Small signals help you notice patterns. Share only what feels useful today.</p></div><div className="absolute -right-8 -top-10 size-40 rounded-full border border-primary/20 bg-primary/10 blur-[1px]" aria-hidden />
      </header>

      {saved ? <p className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">Daily entry saved.</p> : null}
      {symptom_saved ? <p className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">Symptom saved.</p> : null}
      {question_saved ? <p className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">Question saved.</p> : null}
      {already ? <p className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">You already completed today’s check-in.</p> : null}
      {error ? <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      {safety === "need_support" ? <section className="rounded-3xl border border-rose-300/50 bg-rose-50 p-5 text-rose-950 shadow-[0_16px_45px_rgba(225,29,72,.1)] dark:bg-rose-950/25 dark:text-rose-50"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-700 dark:text-rose-300">Support is ready</p><h2 className="mt-1 font-display text-xl font-bold">You do not have to handle this alone.</h2><p className="mt-2 text-sm leading-relaxed text-rose-900/75 dark:text-rose-100/75">If you may hurt yourself or someone else, or cannot stay safe, call emergency services now.</p><div className="mt-4 grid gap-2 sm:grid-cols-3"><a href="tel:911" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white"><PhoneCall className="size-4" />Call 911</a><a href="tel:1553" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white/70 px-4 text-sm font-bold text-rose-900 dark:bg-rose-950/40 dark:text-rose-50"><PhoneCall className="size-4" />Call 1553</a><a href="/help" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-rose-300 bg-white/70 px-4 text-sm font-bold text-rose-900 dark:bg-rose-950/40 dark:text-rose-50">Open Help Center</a></div>{profile?.emergency_contact_phone ? <a href={`tel:${profile.emergency_contact_phone}`} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white/70 px-4 text-sm font-bold text-rose-900 dark:bg-rose-950/40 dark:text-rose-50"><PhoneCall className="size-4" />Call {profile.emergency_contact_name || "trusted contact"}</a> : <p className="mt-3 text-xs text-rose-900/65 dark:text-rose-100/65">Add trusted contact details in Profile for faster support.</p>}<p className="mt-3 text-xs text-rose-900/65 dark:text-rose-100/65">PROMISE is not an emergency service. Do not wait for a reply here.</p></section> : null}
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-300/30 bg-[linear-gradient(135deg,rgba(236,253,245,.8),rgba(255,255,255,.7))] p-5 shadow-[0_16px_45px_rgba(16,185,129,.08)] dark:bg-emerald-950/15 sm:p-6">
        <div className="relative z-10"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Safety signal</p><h2 className="mt-1 font-display text-xl font-bold">How are you right now?</h2></div><span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-xl">✦</span></div>
        <p className="mt-1 text-sm text-muted-foreground">This is private and does not contact anyone automatically. If you are in immediate danger, call 911.</p>
        <form action={saveSafetyCheckin} className="mt-4 grid gap-2 sm:grid-cols-2">
          <button name="status" value="safe" className="min-h-12 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">I’m safe for now</button>
          <button name="status" value="need_support" className="min-h-12 rounded-xl border border-rose-300/60 bg-rose-50 px-4 text-sm font-bold text-rose-900 dark:bg-rose-950/30 dark:text-rose-100">I need support</button>
        </form>
        </div><div className="absolute -bottom-12 -right-8 size-32 rounded-full bg-emerald-300/20 blur-2xl" aria-hidden /></section>

      {todayEntry ? <section className="surface-card rounded-3xl p-5"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary"><CheckCircle2 className="size-5" /></span><div><h2 className="font-semibold">Today’s check-in is complete</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Your entry is saved. Come back tomorrow; no need to submit it again.</p></div></div></section> : <DailyWellnessForm today={today} />}

      <section className="space-y-3"><div><p className="section-label text-primary">Symptom journey</p><h2 className="mt-1 text-xl font-semibold">Record a symptom</h2><p className="mt-1 text-sm text-muted-foreground">Track your own entries over time. This does not diagnose PCOS.</p></div><SymptomRecordForm today={today} />{symptoms?.length ? <ul className="surface-card overflow-hidden rounded-3xl">{symptoms.map((symptom, index) => <li key={symptom.id} className={`px-4 py-3 ${index ? "border-t border-border" : ""}`}><div className="flex gap-3"><div className="min-w-0 flex-1"><p className="font-medium">{symptom.symptom} · {symptom.body_area}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(symptom.occurred_on)} · severity {symptom.severity}/5 · {symptom.frequency} · {symptom.change}</p>{symptom.notes ? <p className="mt-1 text-xs text-muted-foreground">{symptom.notes}</p> : null}</div><details><summary className="cursor-pointer text-sm font-medium text-primary">Edit</summary><form action={updateSymptomRecord} className="mt-3 grid gap-2 sm:grid-cols-2"><input type="hidden" name="id" value={symptom.id} /><input name="symptom" defaultValue={symptom.symptom} required maxLength={80} className="rounded-lg border border-input bg-background px-2 py-1 text-sm" /><input name="body_area" defaultValue={symptom.body_area} required maxLength={80} className="rounded-lg border border-input bg-background px-2 py-1 text-sm" /><input name="occurred_on" type="date" defaultValue={symptom.occurred_on} required className="rounded-lg border border-input bg-background px-2 py-1 text-sm" /><input name="severity" type="number" min="1" max="5" defaultValue={symptom.severity} required className="rounded-lg border border-input bg-background px-2 py-1 text-sm" /><select name="frequency" defaultValue={symptom.frequency} className="rounded-lg border border-input bg-background px-2 py-1 text-sm"><option>once</option><option>occasional</option><option>frequent</option><option>constant</option></select><select name="change" defaultValue={symptom.change} className="rounded-lg border border-input bg-background px-2 py-1 text-sm"><option>improved</option><option>same</option><option>worsened</option></select><input name="duration" defaultValue={symptom.duration ?? ""} maxLength={80} placeholder="Duration" className="rounded-lg border border-input bg-background px-2 py-1 text-sm" /><textarea name="notes" defaultValue={symptom.notes ?? ""} maxLength={500} className="rounded-lg border border-input bg-background px-2 py-1 text-sm sm:col-span-2" /><Button type="submit" size="sm" className="sm:col-span-2">Save changes</Button></form></details><form action={deleteSymptomRecord}><input type="hidden" name="id" value={symptom.id} /><Button type="submit" variant="ghost" size="icon-sm" aria-label={`Delete ${symptom.symptom} entry`}><Trash2 className="size-4" /></Button></form></div></li>)}</ul> : <p className="surface-muted rounded-3xl border border-dashed border-border px-5 py-6 text-center text-sm text-muted-foreground">No symptom records yet.</p>}</section>
      <Link href="/journey" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/20 px-4 text-sm font-semibold text-primary">Open Health Journey<ArrowRight className="size-4" /></Link>

      <section className="space-y-3"><div><p className="section-label text-primary">Prepare for care</p><h2 className="mt-1 text-xl font-semibold">Questions for a healthcare professional</h2></div><form action={saveClinicianQuestion} className="surface-card grid gap-3 rounded-3xl p-5"><textarea name="question" required maxLength={500} placeholder="What would I like to ask?" className="min-h-20 rounded-xl border border-input bg-background px-3 py-2" /><Button type="submit" className="rounded-xl">Save question</Button></form>{questions?.length ? <ul className="surface-card overflow-hidden rounded-3xl">{questions.map((item, index) => <li key={item.id} className={`flex items-start gap-3 px-4 py-3 ${index ? "border-t border-border" : ""}`}><p className="min-w-0 flex-1 text-sm">{item.question}</p><form action={deleteClinicianQuestion}><input type="hidden" name="id" value={item.id} /><Button type="submit" variant="ghost" size="icon-sm" aria-label="Delete saved question"><Trash2 className="size-4" /></Button></form></li>)}</ul> : null}</section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Recent entries</h2>
        {!logs?.length ? <p className="surface-muted rounded-3xl border border-dashed border-border px-5 py-6 text-center text-sm text-muted-foreground">No daily entries yet. Log only what feels useful.</p> : (
          <ul className="surface-card overflow-hidden rounded-3xl">
            {logs.map((log, index) => (
              <li key={log.id} className={`flex gap-3 px-4 py-3 ${index ? "border-t border-border" : ""}`}>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{formatDate(log.log_date)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{summary(log)}</p>
                  {log.notes ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{log.notes}</p> : null}
                </div>
                <form action={deleteDailyWellnessLog}>
                  <input type="hidden" name="id" value={log.id} />
                  <Button type="submit" variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label={`Delete entry for ${log.log_date}`}><Trash2 className="size-4" /></Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function summary(log: { pain_level: number | null; fatigue_level: number | null; mood: string | null; acne_change: string | null; sleep_hours: number | null; activity_minutes: number | null; stress_level: number | null }) {
  return [log.pain_level != null && `pain ${log.pain_level}/10`, log.fatigue_level != null && `fatigue ${log.fatigue_level}/10`, log.mood, log.acne_change && `acne ${log.acne_change}`, log.sleep_hours != null && `${log.sleep_hours}h sleep`, log.activity_minutes != null && `${log.activity_minutes}m activity`, log.stress_level != null && `stress ${log.stress_level}/5`].filter(Boolean).join(" · ") || "No measures recorded";
}
