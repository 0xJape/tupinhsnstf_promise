import Link from "next/link";
import { ExternalLink, HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin";
import { cn } from "@/lib/utils";

type Filter = "open" | "high" | "moderate" | "all";
type Props = { searchParams: Promise<{ priority?: string }> };
function shortId(id: string) { return `PR-${id.slice(0, 8).toUpperCase()}`; }
function date(value?: string | null) { return value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—"; }

export default async function ReferralsPage({ searchParams }: Props) {
  const requested = (await searchParams).priority;
  const filter: Filter = requested === "high" || requested === "moderate" || requested === "all" ? requested : "open";
  const { supabase, role } = await requireAdmin();
  let query = supabase.from("referral_cases").select("id, user_id, assessment_id, status, preferred_call_at, time_zone, created_at, notification_event_id").order("created_at", { ascending: true }).limit(100);
  if (filter !== "all") query = query.in("status", ["new", "contacting"]);
  const { data: cases, error } = await query;
  if (error) throw new Error("Referral queue could not be loaded.");
  const userIds = [...new Set((cases ?? []).map((item) => item.user_id))];
  const assessmentIds = [...new Set((cases ?? []).map((item) => item.assessment_id))];
  const eventIds = (cases ?? []).flatMap((item) => item.notification_event_id ? [item.notification_event_id] : []);
  const [profilesResult, assessmentsResult, eventsResult] = await Promise.all([
    userIds.length ? supabase.from("profiles").select("id, full_name").in("id", userIds) : Promise.resolve({ data: [], error: null }),
    assessmentIds.length ? supabase.from("risk_assessments").select("id, category, total_score, rule_version").in("id", assessmentIds) : Promise.resolve({ data: [], error: null }),
    eventIds.length ? supabase.from("notification_events").select("id, status").in("id", eventIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (profilesResult.error || assessmentsResult.error || eventsResult.error) throw new Error("Referral queue details could not be loaded.");
  const profiles = new Map((profilesResult.data ?? []).map((row) => [row.id, row]));
  const assessments = new Map((assessmentsResult.data ?? []).map((row) => [row.id, row]));
  const events = new Map((eventsResult.data ?? []).map((row) => [row.id, row]));
  const visible = (cases ?? []).filter((item) => { const category = assessments.get(item.assessment_id)?.category; return filter === "high" ? category === "High" : filter === "moderate" ? category === "Moderate" : true; }).sort((a, b) => { const rank = (category?: string) => category === "High" ? 0 : category === "Moderate" ? 1 : 2; return rank(assessments.get(a.assessment_id)?.category) - rank(assessments.get(b.assessment_id)?.category) || a.created_at.localeCompare(b.created_at); });

  await supabase.rpc("log_admin_event", { action_name: "referrals.queue_view", target_type: "referral_case", after_data: { filter, rows: visible.length } });

  return <>
    <header><p className="section-label text-primary">Patient-requested guidance</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Referral queue</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Open requests sorted by screening category, then oldest request. Operational ordering only—not clinical urgency or triage.</p></header>
    <nav className="flex flex-wrap gap-2" aria-label="Referral filters">{(["open", "high", "moderate", "all"] as Filter[]).map((item) => <Link key={item} href={`/admin/referrals?priority=${item}`} aria-current={filter === item ? "page" : undefined} className={cn(buttonVariants({ variant: filter === item ? "default" : "outline", size: "sm" }), "capitalize")}>{item === "high" ? "High screening result" : item === "moderate" ? "Moderate screening result" : item}</Link>)}</nav>
    <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><caption className="sr-only">Patient-requested referral cases</caption><thead className="border-b border-border bg-muted/35 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Participant</th><th className="px-4 py-3">Screening</th><th className="px-4 py-3">Request</th><th className="px-4 py-3">Callback preference</th><th className="px-4 py-3">Case</th><th className="px-4 py-3">Notification</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-border">{visible.map((item) => { const profile = profiles.get(item.user_id); const assessment = assessments.get(item.assessment_id); const event = item.notification_event_id ? events.get(item.notification_event_id) : null; return <tr key={item.id} className="hover:bg-muted/25"><td className="px-4 py-4"><p className="font-semibold">{role === "research_admin" ? profile?.full_name ?? "Participant" : shortId(item.user_id)}</p><p className="font-mono text-xs text-muted-foreground">{shortId(item.user_id)}</p></td><td className="px-4 py-4"><Badge variant={assessment?.category === "High" ? "destructive" : "outline"}>{assessment?.category ?? "Unknown"}</Badge><p className="mt-1 text-xs text-muted-foreground">Score {assessment?.total_score ?? "—"}</p></td><td className="px-4 py-4">{date(item.created_at)}</td><td className="px-4 py-4">{date(item.preferred_call_at)}{item.time_zone && <p className="text-xs text-muted-foreground">{item.time_zone}</p>}</td><td className="px-4 py-4"><Badge variant="secondary">{item.status.replaceAll("_", " ")}</Badge></td><td className="px-4 py-4"><Badge variant={event?.status === "failed" ? "destructive" : "outline"}>{event?.status ?? "not linked"}</Badge></td><td className="px-4 py-4">{role === "research_admin" ? <Link href={`/admin/participants/${item.user_id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>View details<ExternalLink className="size-3.5" aria-hidden /></Link> : <span className="text-xs text-muted-foreground">Case access</span>}</td></tr>; })}</tbody></table>{!visible.length && <div className="flex flex-col items-center px-6 py-16 text-center"><HeartHandshake className="size-8 text-muted-foreground" aria-hidden /><p className="mt-3 font-semibold">No matching referral requests</p><p className="text-sm text-muted-foreground">Change filter or wait for patient opt-in.</p></div>}</div></CardContent></Card>
  </>;
}
