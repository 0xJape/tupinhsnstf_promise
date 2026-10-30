import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SymptomTrendChart } from "@/components/journey/symptom-trend-chart";

type Props = { searchParams: Promise<{ from?: string; to?: string; compare?: string | string[] }> };

export default async function JourneyPage({ searchParams }: Props) {
  const { from, to, compare } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("symptom_records")
    .select("id, symptom, body_area, occurred_on, severity, frequency, duration, change, notes")
    .eq("user_id", user.id);
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) query = query.gte("occurred_on", from);
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) query = query.lte("occurred_on", to);
  const { data: records } = await query.order("occurred_on", { ascending: false }).limit(100);
  const { data: periods } = await supabase.from("menstrual_logs").select("start_date").eq("user_id", user.id).order("start_date", { ascending: false }).limit(12);

  const symptoms = [...new Set((records ?? []).map((record) => record.symptom))];
  const selectedSymptoms = (Array.isArray(compare) ? compare : compare ? [compare] : []).filter((value) => symptoms.includes(value)).slice(0, 2);
  const comparisonRecords = selectedSymptoms.map((symptom) => ({ symptom, records: (records ?? []).filter((record) => record.symptom === symptom) }));
  const changedRecords = (records ?? []).filter((record) => record.change !== "same");
  return <div className="space-y-6 pb-6">
    <header className="rounded-[28px] border border-primary/20 bg-primary/5 p-6 sm:p-8">
      <Link href="/track" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-4 rounded-xl")}><ArrowLeft className="size-4" />Back to tracking</Link>
      <p className="section-label text-primary">Health Journey</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Your symptom timeline</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Review what you recorded over time. This view describes your entries; it does not diagnose PCOS or identify causes.</p>
    </header>

    {!records?.length ? <section className="surface-muted rounded-3xl border border-dashed border-border px-5 py-8 text-center"><p className="text-sm text-muted-foreground">Add symptom records to start your journey.</p><Link href="/track" className={cn(buttonVariants({ size: "lg" }), "mt-4 rounded-xl")}>Record a symptom<ArrowRight className="size-4" /></Link></section> : <>
      <section className="surface-card rounded-3xl p-5"><p className="section-label text-primary">Filter by date</p><form className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="grid gap-1 text-sm font-medium">From<input name="from" type="date" defaultValue={from} className="rounded-xl border border-border bg-background px-3 py-2 font-normal" /></label><label className="grid gap-1 text-sm font-medium">To<input name="to" type="date" defaultValue={to} className="rounded-xl border border-border bg-background px-3 py-2 font-normal" /></label><button type="submit" className={cn(buttonVariants({ size: "default" }), "rounded-xl")}>Apply filter</button></form><div className="mt-4 flex flex-wrap gap-2">{symptoms.map((symptom) => <span key={symptom} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{symptom}</span>)}</div><p className="mt-3 text-xs text-muted-foreground">{records.length} record{records.length === 1 ? "" : "s"} shown. Entries remain self-reported.</p><form className="mt-5 border-t border-border pt-4"><p className="text-sm font-semibold">Compare up to two symptoms</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{symptoms.map((symptom) => <label key={symptom} className="flex items-center gap-2 text-sm"><input type="checkbox" name="compare" value={symptom} defaultChecked={selectedSymptoms.includes(symptom)} />{symptom}</label>)}</div><button type="submit" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 rounded-xl")}>Compare selected</button></form></section>
      {comparisonRecords.length === 2 ? <section className="surface-card rounded-3xl p-5"><p className="section-label text-primary">Recorded comparison</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{comparisonRecords.map(({ symptom, records: symptomEntries }) => <div key={symptom} className="rounded-2xl bg-muted/50 p-4"><h2 className="font-semibold">{symptom}</h2><p className="mt-2 text-sm text-muted-foreground">{symptomEntries.length} recorded entr{symptomEntries.length === 1 ? "y" : "ies"}</p><p className="mt-1 text-sm">Severity: {symptomEntries.map((record) => record.severity).join(", ")} / 5</p><p className="mt-1 text-xs text-muted-foreground">These entries show recorded values only; they do not establish a cause.</p></div>)}</div></section> : null}
      <section className="surface-card rounded-3xl p-5"><p className="section-label text-primary">Severity trends</p><h2 className="mt-1 text-lg font-semibold">Changes over time</h2><SymptomTrendChart records={(records ?? []).map(({ symptom, occurred_on, severity }) => ({ symptom, occurred_on, severity }))} periodStartDates={(periods ?? []).map(({ start_date }) => start_date)} selectedSymptoms={selectedSymptoms} /></section>
      <section className="surface-card rounded-3xl p-5"><p className="section-label text-primary">What changed?</p><p className="mt-2 text-sm text-muted-foreground">{changedRecords.length ? `You recorded ${changedRecords.length} entr${changedRecords.length === 1 ? "y" : "ies"} marked improved or worsened.` : "No entries marked improved or worsened in this view."}</p>{periods?.length ? <p className="mt-2 text-xs text-muted-foreground">Cycle context available from {periods.length} recorded period start{periods.length === 1 ? "" : "s"}. This does not establish a cause.</p> : null}</section>
      <section className="space-y-3"><h2 className="text-lg font-semibold">Timeline</h2><ol className="space-y-3">{records.map((record) => <li key={record.id} className="surface-card rounded-3xl p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{record.symptom}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(record.occurred_on)} · {record.body_area}</p></div><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{record.severity}/5</span></div><p className="mt-3 text-sm text-muted-foreground">{record.frequency} · {record.change}{record.duration ? ` · ${record.duration}` : ""}</p>{record.notes ? <p className="mt-2 rounded-xl bg-muted/50 px-3 py-2 text-sm">{record.notes}</p> : null}</li>)}</ol></section>
    </>}
  </div>;
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
