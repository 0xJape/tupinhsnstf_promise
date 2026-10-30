import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { createClient } from "@/lib/supabase/server";
import { FeedbackSuccessModal } from "@/components/feedback/FeedbackSuccessModal";

const ratingFields = [
  ["usability_rating", "Usability"],
  ["accessibility_rating", "Accessibility"],
  ["relevance_rating", "Relevance"],
] as const;

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const params = await searchParams;
  async function submitFeedback(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const rating = Number(formData.get("rating"));
    const helpful = String(formData.get("helpful"));
    const comments = String(formData.get("comments") ?? "").trim().slice(0, 2000);
    const featureIdentifier = String(formData.get("feature_identifier") ?? "").trim().slice(0, 100);
    const expandedRatings = Object.fromEntries(ratingFields.map(([name]) => [name, Number(formData.get(name))]));
    const ratings = [rating, ...Object.values(expandedRatings)];
    if (ratings.some((value) => !Number.isInteger(value) || value < 1 || value > 5) || !["yes", "somewhat", "no"].includes(helpful)) redirect("/feedback?error=invalid");
    const { error } = await supabase.from("user_feedback").insert({ user_id: user.id, rating, helpful, comments: comments || null, feature_identifier: featureIdentifier || null, ...expandedRatings });
    if (error) redirect("/feedback?error=save");
    redirect("/feedback?saved=1");
  }

  return <div className="mx-auto max-w-xl space-y-6">
    {params.saved === "1" ? <FeedbackSuccessModal /> : null}
    <header className="surface-card space-y-2 rounded-3xl p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Your feedback</p><h1 className="font-display text-3xl font-bold">How was your experience?</h1><p className="text-sm leading-6 text-muted-foreground">Your response helps improve PROMISE. Do not include urgent concerns or private medical details.</p></header>
    <form action={submitFeedback} className="surface-card space-y-5 rounded-3xl p-6">
      {params.error ? <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{params.error === "invalid" ? "Choose a rating from 1 to 5 for every category." : "Feedback could not be saved. Please try again."}</p> : null}
      <fieldset className="space-y-2"><legend className="text-sm font-semibold">Overall rating</legend><div className="flex gap-1">{[1,2,3,4,5].map((value) => <label key={value} className="group cursor-pointer rounded-xl border border-transparent px-2 py-1 text-3xl leading-none text-slate-300 transition hover:scale-110 hover:text-amber-400 has-[:checked]:border-amber-300/60 has-[:checked]:bg-amber-50 has-[:checked]:text-amber-500 dark:text-slate-600 dark:has-[:checked]:bg-amber-950/30" title={`${value} out of 5 stars`}><input className="sr-only" type="radio" name="rating" value={value} required />★<span className="sr-only">{value} out of 5 stars</span></label>)}</div></fieldset>
      {ratingFields.map(([name, label]) => <fieldset key={name} className="space-y-2"><legend className="text-sm font-semibold">{label}</legend><div className="flex flex-wrap gap-2">{[1,2,3,4,5].map((value) => <label key={value} className="flex cursor-pointer items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10"><input type="radio" name={name} value={value} required />{value}</label>)}</div></fieldset>)}
      <fieldset className="space-y-2"><legend className="text-sm font-semibold">Was this feature helpful?</legend>{[["yes","Yes"],["somewhat","Somewhat"],["no","No"]].map(([value,label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="radio" name="helpful" value={value} required />{label}</label>)}</fieldset>
      <label className="block space-y-2 text-sm font-semibold" htmlFor="feature_identifier">Feature or page <span className="font-normal text-muted-foreground">(optional)</span><input id="feature_identifier" name="feature_identifier" maxLength={100} placeholder="For example: cycle tracker" className="w-full rounded-2xl border border-border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-primary/30" /></label>
      <label className="block space-y-2 text-sm font-semibold" htmlFor="comments">Additional comments<textarea id="comments" name="comments" maxLength={2000} rows={5} className="w-full rounded-2xl border border-border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-primary/30" /></label>
      <SubmitButton pendingLabel="Sending…" className="min-h-12 w-full rounded-xl">Send feedback</SubmitButton>
    </form>
  </div>;
}
