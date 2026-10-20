import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { ScreeningQuiz } from "@/components/screening/ScreeningQuiz";
import { createClient } from "@/lib/supabase/server";

export default async function ScreenQuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: baseline } = await supabase
    .from("risk_assessments")
    .select("id")
    .eq("user_id", user.id)
    .eq("assessment_type", "baseline")
    .eq("record_status", "valid")
    .maybeSingle();
  if (baseline) redirect(`/screen/result/${baseline.id}`);

  return (
    <>
      <header className="space-y-3 border-b border-border pb-5">
        <Link
          href="/screen"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Screening
        </Link>
        <div className="space-y-1.5">
          <p className="section-label text-primary">Quiz</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Answer honestly
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Large Yes/No per item. Age at first period helps interpret cycles.
            You can go back before submit.
          </p>
        </div>
      </header>

      <DisclaimerBanner compact />

      <ScreeningQuiz />
    </>
  );
}