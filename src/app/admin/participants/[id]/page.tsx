import Link from "next/link";
import { ArrowLeft, CalendarDays, Camera, ClipboardCheck, HeartHandshake } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin";

const shortId = (id: string) => `PR-${id.slice(0, 8).toUpperCase()}`;
const date = (value?: string | null) => value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
const label = (value: string) => value.replaceAll("_", " ");
const ageBand = (birthDate: string) => { const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / 31_557_600_000); return age < 18 ? "Under 18" : age < 25 ? "18–24" : age < 35 ? "25–34" : age < 45 ? "35–44" : "45+"; };
type Props = { params: Promise<{ id: string }> };

export default async function ParticipantDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireAdmin(["research_admin"]);
  const results = await Promise.all([
    supabase.from("profiles").select("id, full_name, date_of_birth, onboarding_complete, height_cm, weight_kg, activity_level, sleep_band, stress_level, created_at, updated_at").eq("id", id).maybeSingle(),
    supabase.from("consents").select("policy_version, accepted_at").eq("user_id", id).order("accepted_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("risk_assessments").select("id, category, total_score, rule_version, referral_recommended, contributing_factors, bmi_at_assessment, created_at").eq("user_id", id).eq("assessment_type", "baseline").eq("record_status", "valid").maybeSingle(),
    supabase.from("menstrual_logs").select("id, start_date, duration_days, flow, pain_level", { count: "exact" }).eq("user_id", id).order("start_date", { ascending: false }).limit(6),
    supabase.from("daily_wellness_logs").select("id, log_date", { count: "exact" }).eq("user_id", id).order("log_date", { ascending: false }).limit(1),
    supabase.from("referral_cases").select("id, status, preferred_call_at, created_at").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("assessment_correction_requests").select("id, status, created_at").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("photo_symptom_assessments").select("id, acne_like_spots, coarse_facial_hair, image_quality, limitations, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(5),
  ]);
  const [profileResult, consentResult, assessmentResult, periodsResult, wellnessResult, referralsResult, correctionsResult, photosResult] = results;
  if (!profileResult.data) notFound();
  if (results.some((result) => result.error)) throw new Error("Participant summary could not be loaded.");
  const profile = profileResult.data;
  const assessment = assessmentResult.data;
  const factors = (assessment?.contributing_factors ?? []) as { id: string; label: string }[];

  await supabase.rpc("log_admin_event", { action_name: "participant.summary_view", subject_id: id, target_type: "participant", target_id: id, after_data: { baseline_id: assessment?.id ?? null } });

  return <>
    <header>
      <Link href="/admin/participants" className={buttonVariants({ variant: "ghost", size: "sm" })}><ArrowLeft className="size-4" aria-hidden />Participants</Link>
      <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="font-mono text-xs text-muted-foreground">{shortId(id)}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{profile.full_name}</h1><p className="mt-2 text-sm text-muted-foreground">Participant data summary · {ageBand(profile.date_of_birth)} · updated {date(profile.updated_at)}</p></div><Badge variant={profile.onboarding_complete ? "secondary" : "outline"}>{profile.onboarding_complete ? "Setup complete" : "Setup pending"}</Badge></div>
    </header>

    <section className="grid gap-4 lg:grid-cols-2">
      <SummaryCard title="Participant details" icon={ClipboardCheck}><DataGrid rows={[["Study ID", shortId(id)], ["Date of birth", date(profile.date_of_birth)], ["Height", profile.height_cm ? `${profile.height_cm} cm` : "Not recorded"], ["Weight", profile.weight_kg ? `${profile.weight_kg} kg` : "Not recorded"], ["Consent", consentResult.data ? `Policy ${consentResult.data.policy_version} · ${date(consentResult.data.accepted_at)}` : "No record"]]} /></SummaryCard>
      <SummaryCard title="Baseline screening" icon={ClipboardCheck}>{assessment ? <><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{assessment.category}</Badge><span className="font-semibold">Score {assessment.total_score}</span><span className="text-sm text-muted-foreground">{assessment.rule_version}</span></div><DataGrid rows={[["Screening date", date(assessment.created_at)], ["BMI at screening", assessment.bmi_at_assessment ?? "Not recorded"], ["Referral suggested", assessment.referral_recommended ? "Yes" : "No"]]} />{factors.length > 0 && <><h3 className="mt-4 text-sm font-semibold">Contributing factors</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{factors.map((factor) => <li key={factor.id}>{factor.label}</li>)}</ul></>}<p className="mt-3 text-xs text-muted-foreground">Rule-based educational result, not diagnosis or triage.</p></> : <p className="text-sm text-muted-foreground">Baseline not completed.</p>}</SummaryCard>
      <SummaryCard title="Tracking history" icon={CalendarDays}><DataGrid rows={[["Period logs", String(periodsResult.count ?? 0)], ["Latest period", periodsResult.data?.[0]?.start_date ?? "—"], ["Wellness logs", String(wellnessResult.count ?? 0)], ["Latest wellness log", wellnessResult.data?.[0]?.log_date ?? "—"], ["Activity", profile.activity_level ?? "Not recorded"], ["Sleep", profile.sleep_band ?? "Not recorded"], ["Stress", profile.stress_level == null ? "Not recorded" : String(profile.stress_level)]]} />{periodsResult.data?.length ? <div className="mt-4 border-t border-border pt-3"><h3 className="text-sm font-semibold">Recent period starts</h3><ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">{periodsResult.data.map((log) => <li key={log.id}>{log.start_date} · {log.duration_days ?? "—"} days · {log.flow ?? "flow not set"}</li>)}</ul></div> : null}</SummaryCard>
      <SummaryCard title="Photo observations" icon={Camera}><p className="mb-3 text-xs leading-relaxed text-muted-foreground">Derived from transient participant photos. Images were not stored. Observations do not alter screening score or establish diagnosis.</p>{photosResult.data?.length ? <ul className="space-y-3">{photosResult.data.map((item) => <li key={item.id} className="rounded-xl border border-border p-3 text-sm"><p className="font-semibold">{date(item.created_at)} · {label(item.image_quality)}</p><p className="mt-1">Acne-like spots: {label(item.acne_like_spots)}</p><p>Coarse facial hair: {label(item.coarse_facial_hair)}</p>{item.limitations.length ? <p className="mt-1 text-xs text-muted-foreground">Limitations: {item.limitations.join("; ")}</p> : null}</li>)}</ul> : <p className="text-sm text-muted-foreground">No photo observations.</p>}</SummaryCard>
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <SummaryCard title="Referral history" icon={HeartHandshake}>{referralsResult.data?.length ? <div className="space-y-3">{referralsResult.data.map((item) => <Link key={item.id} href="/admin/referrals" className="flex min-h-11 items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/30"><div><p className="text-sm font-medium">Requested {date(item.created_at)}</p><p className="text-xs text-muted-foreground">Callback {date(item.preferred_call_at)}</p></div><Badge variant="outline">{label(item.status)}</Badge></Link>)}</div> : <p className="text-sm text-muted-foreground">No patient-requested referrals.</p>}</SummaryCard>
      <SummaryCard title="Correction requests" icon={ClipboardCheck}>{correctionsResult.data?.length ? <div className="space-y-3">{correctionsResult.data.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl border border-border p-3"><p className="text-sm">Requested {date(item.created_at)}</p><Badge variant="outline">{label(item.status)}</Badge></div>)}</div> : <p className="text-sm text-muted-foreground">No baseline correction requests.</p>}</SummaryCard>
    </section>
  </>;
}

function SummaryCard({ title, icon: Icon, children }: { title: string; icon: typeof CalendarDays; children: React.ReactNode }) { return <Card><CardHeader><div className="flex items-center gap-2 text-primary"><Icon className="size-4" aria-hidden /><CardTitle>{title}</CardTitle></div></CardHeader><CardContent>{children}</CardContent></Card>; }
function DataGrid({ rows }: { rows: [string, string | number][] }) { return <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">{rows.map(([key, value]) => <div key={key}><dt className="text-xs text-muted-foreground">{key}</dt><dd className="font-medium">{value}</dd></div>)}</dl>; }
