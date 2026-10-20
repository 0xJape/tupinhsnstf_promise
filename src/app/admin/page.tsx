import Link from "next/link";
import { ArrowRight, BellRing, ClipboardCheck, ShieldCheck, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin";

type Category = "Low" | "Moderate" | "High";

export default async function AdminDashboardPage() {
  const { supabase, role } = await requireAdmin(["research_admin"]);
  const [profilesResult, assessmentsResult, consentsResult, notificationsResult, correctionsResult] = await Promise.all([
    supabase.from("profiles").select("id, onboarding_complete, created_at"),
    supabase.from("risk_assessments").select("user_id, category, created_at").eq("assessment_type", "baseline").eq("record_status", "valid"),
    supabase.from("consents").select("user_id, policy_version, accepted_at"),
    supabase.from("notification_events").select("status, event_type, created_at"),
    supabase.from("assessment_correction_requests").select("id, status").eq("status", "open"),
  ]);
  const failed = [profilesResult, assessmentsResult, consentsResult, notificationsResult, correctionsResult].find((result) => result.error);
  if (failed?.error) throw new Error("Admin dashboard data could not be loaded.");

  const profiles = profilesResult.data ?? [];
  const assessments = assessmentsResult.data ?? [];
  const consents = consentsResult.data ?? [];
  const notifications = notificationsResult.data ?? [];
  const corrections = correctionsResult.data ?? [];
  const latestPolicy = consents.map((row) => row.policy_version).sort().at(-1);
  const currentConsentUsers = new Set(consents.filter((row) => row.policy_version === latestPolicy).map((row) => row.user_id));
  const counts: Record<Category, number> = { Low: 0, Moderate: 0, High: 0 };
  assessments.forEach((row) => counts[row.category as Category] += 1);
  const maxCategory = Math.max(1, ...Object.values(counts));
  const funnel = [
    { label: "Registered", value: profiles.length },
    { label: "Current consent", value: currentConsentUsers.size },
    { label: "Onboarding complete", value: profiles.filter((row) => row.onboarding_complete).length },
    { label: "Baseline complete", value: new Set(assessments.map((row) => row.user_id)).size },
  ];
  const maxFunnel = Math.max(1, profiles.length);

  await supabase.rpc("log_admin_event", { action_name: "dashboard.view", target_type: "dashboard" });

  return (
    <>
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="section-label text-primary">Research operations</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Admin dashboard</h1><p className="mt-2 text-sm text-muted-foreground">Real operational counts. No diagnosis or predicted outcomes.</p></div><Badge variant="outline">{role.replace("_", " ")}</Badge></header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
        <Metric icon={UsersRound} label="Participants" value={profiles.length} detail={`${funnel[2].value} onboarding complete`} />
        <Metric icon={ClipboardCheck} label="Baselines" value={assessments.length} detail={`${Math.round((assessments.length / Math.max(1, profiles.length)) * 100)}% of participants`} />
        <Metric icon={ShieldCheck} label="Current consent" value={currentConsentUsers.size} detail={latestPolicy ? `Policy ${latestPolicy}` : "No consent records"} />
        <Metric icon={BellRing} label="Needs attention" value={notifications.filter((row) => row.status === "failed").length + corrections.length} detail={`${corrections.length} review requests`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>Baseline category distribution</CardTitle><p className="text-sm text-muted-foreground">Latest valid baseline per participant</p></CardHeader><CardContent><div className="space-y-4">{(Object.entries(counts) as [Category, number][]).map(([label, value]) => <Bar key={label} label={label} value={value} max={maxCategory} tone={label === "Low" ? "bg-emerald-500" : label === "Moderate" ? "bg-amber-500" : "bg-rose-500"} />)}</div><p className="mt-5 text-xs text-muted-foreground">Text values accompany bars for accessible reading.</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Onboarding funnel</CardTitle><p className="text-sm text-muted-foreground">Current database completion states</p></CardHeader><CardContent><div className="space-y-4">{funnel.map((item) => <Bar key={item.label} label={item.label} value={item.value} max={maxFunnel} tone="bg-primary" />)}</div></CardContent></Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2"><Link href="/admin/participants" className="surface-card group flex items-center gap-4 p-5 hover:border-primary/30"><div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><UsersRound className="size-5" aria-hidden /></div><div className="min-w-0 flex-1"><h2 className="font-semibold">Participant operations</h2><p className="text-sm text-muted-foreground">Review setup, baseline, and operational state.</p></div><ArrowRight className="size-5 text-muted-foreground group-hover:text-primary" aria-hidden /></Link><Link href="/admin/referrals" className="surface-card group flex items-center gap-4 p-5 hover:border-primary/30"><div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300"><BellRing className="size-5" aria-hidden /></div><div className="min-w-0 flex-1"><h2 className="font-semibold">Referral operations</h2><p className="text-sm text-muted-foreground">Review patient-requested guidance queue.</p></div><ArrowRight className="size-5 text-muted-foreground group-hover:text-primary" aria-hidden /></Link></section>
    </>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof UsersRound; label: string; value: number; detail: string }) { return <Card size="sm"><CardHeader><div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-4" aria-hidden /></div><CardTitle className="mt-3 text-sm">{label}</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></CardContent></Card>; }
function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) { const pct = Math.round((value / max) * 100); return <div><div className="mb-1.5 flex justify-between gap-3 text-sm"><span>{label}</span><span className="font-semibold tabular-nums">{value}</span></div><div className="h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${label}: ${value}`}><div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} /></div></div>; }
