import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin";

type Feedback = {
  id: string;
  rating: number;
  usability_rating: number | null;
  accessibility_rating: number | null;
  relevance_rating: number | null;
  helpful: string;
  feature_identifier: string | null;
  comments: string | null;
  created_at: string;
};

const metrics = [
  ["rating", "Overall"],
  ["usability_rating", "Usability"],
  ["accessibility_rating", "Accessibility"],
  ["relevance_rating", "Relevance"],
] as const;

function average(rows: Feedback[], key: (typeof metrics)[number][0]) {
  const values = rows.flatMap((row) => typeof row[key] === "number" ? [row[key]] : []);
  return values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1) : "—";
}

export default async function AdminFeedbackPage() {
  const { supabase } = await requireAdmin(["research_admin"]);
  const { data, error } = await supabase.from("user_feedback").select("id, rating, usability_rating, accessibility_rating, relevance_rating, helpful, feature_identifier, comments, created_at").order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error("Feedback could not be loaded.");
  const feedback = (data ?? []) as Feedback[];
  await supabase.rpc("log_admin_event", { action_name: "feedback.list_view", target_type: "user_feedback", after_data: { rows: feedback.length } });

  return <>
    <header><p className="section-label text-primary">Experience research</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">User feedback</h1><p className="mt-2 text-sm text-muted-foreground">De-identified responses, newest first. Up to 500 recent submissions.</p></header>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Average ratings">{metrics.map(([key, label]) => <Card key={key}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{average(feedback, key)}<span className="text-sm font-normal text-muted-foreground"> / 5</span></p></CardContent></Card>)}</section>
    <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><caption className="sr-only">Recent de-identified user feedback</caption><thead className="border-b border-border bg-muted/35 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Feature</th><th className="px-4 py-3">Ratings O/U/A/R</th><th className="px-4 py-3">Helpful</th><th className="px-4 py-3">Comments</th></tr></thead><tbody className="divide-y divide-border">{feedback.map((row) => <tr key={row.id}><td className="whitespace-nowrap px-4 py-3">{new Date(row.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</td><td className="px-4 py-3">{row.feature_identifier ?? "—"}</td><td className="whitespace-nowrap px-4 py-3">{[row.rating, row.usability_rating, row.accessibility_rating, row.relevance_rating].map((value) => value ?? "—").join(" / ")}</td><td className="px-4 py-3 capitalize">{row.helpful}</td><td className="max-w-md whitespace-pre-wrap px-4 py-3">{row.comments ?? "—"}</td></tr>)}{feedback.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No feedback submitted yet.</td></tr> : null}</tbody></table></div></CardContent></Card>
  </>;
}