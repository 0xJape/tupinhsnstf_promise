import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
type Props = { searchParams: Promise<{ page?: string }> };

function shortId(id: string) { return `PR-${id.slice(0, 8).toUpperCase()}`; }
function date(value?: string | null) { return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"; }
function ageBand(birthDate: string) { const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / 31_557_600_000); return age < 18 ? "Under 18" : age < 25 ? "18–24" : age < 35 ? "25–34" : age < 45 ? "35–44" : "45+"; }

export default async function ParticipantsPage({ searchParams }: Props) {
  const requested = Number.parseInt((await searchParams).page ?? "1", 10);
  const page = Number.isFinite(requested) && requested > 0 ? requested : 1;
  const from = (page - 1) * PAGE_SIZE;
  const { supabase } = await requireAdmin(["research_admin"]);
  const { data: profiles, count, error } = await supabase.from("profiles").select("id, full_name, date_of_birth, onboarding_complete, created_at, updated_at", { count: "exact" }).order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error("Participant operations list could not be loaded.");

  const ids = (profiles ?? []).map((row) => row.id);
  const [{ data: consents, error: consentError }, { data: assessments, error: assessmentError }, { data: notifications, error: notificationError }] = ids.length ? await Promise.all([
    supabase.from("consents").select("user_id, accepted_at").in("user_id", ids).order("accepted_at", { ascending: false }),
    supabase.from("risk_assessments").select("user_id, category, created_at").in("user_id", ids).eq("assessment_type", "baseline").eq("record_status", "valid"),
    supabase.from("notification_events").select("user_id, status, created_at").in("user_id", ids).order("created_at", { ascending: false }),
  ]) : [{ data: [] }, { data: [] }, { data: [] }];
  if (consentError || assessmentError || notificationError) throw new Error("Participant status details could not be loaded.");

  const firstByUser = <T extends { user_id: string }>(rows: T[]) => new Map(rows.map((row) => [row.user_id, row]));
  const consentByUser = firstByUser(consents ?? []);
  const assessmentByUser = firstByUser(assessments ?? []);
  const notificationByUser = firstByUser(notifications ?? []);
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  await supabase.rpc("log_admin_event", { action_name: "participants.list_view", target_type: "participant", after_data: { page, rows: profiles?.length ?? 0 } });

  return <>
    <header><p className="section-label text-primary">Research operations</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Participants</h1><p className="mt-2 text-sm text-muted-foreground">Minimum operational fields only. {total} participant{total === 1 ? "" : "s"}.</p></header>
    <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[960px] text-left text-sm"><caption className="sr-only">Participant operational status</caption><thead className="border-b border-border bg-muted/35 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3 font-semibold">Participant</th><th className="px-4 py-3 font-semibold">Age band</th><th className="px-4 py-3 font-semibold">Setup</th><th className="px-4 py-3 font-semibold">Consent</th><th className="px-4 py-3 font-semibold">Baseline</th><th className="px-4 py-3 font-semibold">Last activity</th><th className="px-4 py-3 font-semibold">Delivery</th><th className="px-4 py-3 font-semibold"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-border">{(profiles ?? []).map((profile) => { const consent = consentByUser.get(profile.id); const assessment = assessmentByUser.get(profile.id); const notification = notificationByUser.get(profile.id); return <tr key={profile.id} className="hover:bg-muted/25"><td className="px-4 py-4"><p className="font-semibold">{profile.full_name}</p><p className="font-mono text-xs text-muted-foreground">{shortId(profile.id)}</p></td><td className="px-4 py-4">{ageBand(profile.date_of_birth)}</td><td className="px-4 py-4"><Badge variant={profile.onboarding_complete ? "secondary" : "outline"}>{profile.onboarding_complete ? "Complete" : "Pending"}</Badge></td><td className="px-4 py-4">{consent ? date(consent.accepted_at) : <span className="text-muted-foreground">Pending</span>}</td><td className="px-4 py-4">{assessment ? <Badge variant="outline">{assessment.category}</Badge> : <span className="text-muted-foreground">Not started</span>}</td><td className="px-4 py-4">{date(profile.updated_at)}</td><td className="px-4 py-4">{notification ? <Badge variant={notification.status === "failed" ? "destructive" : "outline"}>{notification.status}</Badge> : <span className="text-muted-foreground">None</span>}</td><td className="px-4 py-4"><Link href={`/admin/participants/${profile.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>View<ExternalLink className="size-3.5" aria-hidden /></Link></td></tr>; })}</tbody></table>{!profiles?.length && <div className="flex flex-col items-center px-6 py-16 text-center"><UsersRound className="size-8 text-muted-foreground" aria-hidden /><p className="mt-3 font-semibold">No participants found</p><p className="text-sm text-muted-foreground">Records appear after registration.</p></div>}</div></CardContent></Card>
    <nav className="flex items-center justify-between" aria-label="Participant pages"><p className="text-sm text-muted-foreground">Page {Math.min(page, pages)} of {pages}</p><div className="flex gap-2"><Link aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} href={`/admin/participants?page=${Math.max(1, page - 1)}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), page <= 1 && "pointer-events-none opacity-50")}><ChevronLeft className="size-4" aria-hidden />Previous</Link><Link aria-disabled={page >= pages} tabIndex={page >= pages ? -1 : undefined} href={`/admin/participants?page=${Math.min(pages, page + 1)}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), page >= pages && "pointer-events-none opacity-50")}>Next<ChevronRight className="size-4" aria-hidden /></Link></div></nav>
  </>;
}
