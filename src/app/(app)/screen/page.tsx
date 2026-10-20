import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ClipboardList } from "lucide-react";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { BaselineCorrectionRequest } from "@/components/screening/BaselineCorrectionRequest";
import { PhotoSymptomAssessment } from "@/components/screening/PhotoSymptomAssessment";
import { RiskBadge } from "@/components/screening/RiskBadge";
import { buttonVariants } from "@/components/ui/button";
import { SCREEN_INTRO } from "@/lib/screening/content";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { RiskCategory } from "@/types/screening";

export default async function ScreenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: history } = await supabase
    .from("risk_assessments")
    .select("id, category, total_score, created_at, referral_recommended, assessment_type, record_status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const baseline = history?.find(
    (row) => row.assessment_type === "baseline" && row.record_status === "valid",
  );

  return (
    <>
      <header className="space-y-1.5 border-b border-border pb-5">
        <p className="section-label text-primary">Screen</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          PCOS risk screening
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          22 items in 6 short groups. Most are Yes/No. Allow about 5–8 minutes.
        </p>
      </header>

      <DisclaimerBanner compact />

      <section className="surface-card p-5" aria-label="Baseline screening">
        <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
          <ClipboardList className="size-5" aria-hidden />
        </div>
        <p className="section-label mt-4 text-primary">pcos-screen-v2</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          {baseline ? "Baseline completed" : "Educational questionnaire"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {baseline
            ? "Your first screening is your immutable baseline. Need to fix something? Send a review request instead of retaking it."
            : SCREEN_INTRO}
        </p>
        {baseline ? (
          <div className="mt-5 grid gap-2">
            <Link href={`/screen/result/${baseline.id}`} className={cn(buttonVariants({ size: "lg" }), "min-h-11 w-full rounded-xl")}>
              View baseline
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <BaselineCorrectionRequest assessmentId={baseline.id} />
          </div>
        ) : (
          <>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              <li>· Six focused groups with review before submission</li>
              <li>· Progress stays on this device if you leave</li>
              <li>· BMI modifiers from your profile when set</li>
              <li>· Referral guidance for Moderate / High</li>
            </ul>
            <Link href="/screen/quiz" className={cn(buttonVariants({ size: "lg" }), "mt-5 min-h-11 w-full rounded-xl")}>
              Start baseline
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </>
        )}
      </section>

      {baseline && <PhotoSymptomAssessment baselineAssessmentId={baseline.id} />}

      <section className="space-y-3" aria-label="Past results">
        <h2 className="section-label">History</h2>
        {!history?.length ? (
          <p className="surface-muted px-4 py-5 text-sm text-muted-foreground">
            No screenings yet. Take the quiz when you&apos;re ready — period
            logs not required.
          </p>
        ) : (
          <div className="surface-card overflow-hidden divide-y divide-border">
            {history.map((row) => {
              const category = row.category as RiskCategory;
              const when = new Date(row.created_at).toLocaleDateString(
                undefined,
                { month: "short", day: "numeric", year: "numeric" },
              );
              return (
                <Link
                  key={row.id}
                  href={`/screen/result/${row.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium">{when}</p>
                    <p className="text-xs text-muted-foreground">
                      Score {row.total_score}
                      {row.referral_recommended ? " · referral suggested" : ""}
                    </p>
                  </div>
                  <RiskBadge category={category} size="sm" />
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
