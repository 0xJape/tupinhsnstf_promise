import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PrintSummaryButton } from "@/components/screening/PrintSummaryButton";
import { CATEGORY_COPY, VISIT_QUESTIONS } from "@/lib/screening/content";
import { assessConfidence } from "@/lib/screening/confidence";
import { MAX_SCREEN_SCORE } from "@/lib/rules/pcosScreen";
import {
  computeCycleInsights,
  type PeriodLog,
} from "@/lib/cycle/insights";
import { createClient } from "@/lib/supabase/server";
import type { ContributingFactor, RiskCategory } from "@/types/screening";

type Props = { params: Promise<{ id: string }> };
type SummaryPeriodLog = PeriodLog & {
  flow: string | null;
  pain_level: number | null;
};

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DoctorSummaryPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: assessment }, { data: profile }, { data: periodLogs }, { data: photoAssessments }] = await Promise.all([
    supabase
      .from("risk_assessments")
      .select("id, category, total_score, contributing_factors, bmi_at_assessment, rule_version, created_at, answers")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("full_name, date_of_birth, height_cm, weight_kg, activity_level, exercise_frequency, sleep_band, stress_level")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("menstrual_logs")
      .select("start_date, duration_days, flow, pain_level")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .limit(6),
    supabase
      .from("photo_symptom_assessments")
      .select("id, acne_like_spots, coarse_facial_hair, image_quality, limitations, created_at")
      .eq("user_id", user.id)
      .eq("baseline_assessment_id", id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (!assessment || !profile) notFound();

  const logs = (periodLogs ?? []).reverse() as SummaryPeriodLog[];
  const insights = computeCycleInsights(logs);
  const answers = (assessment.answers ?? {}) as Record<string, unknown>;
  const isLegacy = assessment.rule_version === "pcos-screen-v1";
  const questionnaireComplete = isLegacy
    ? Array.from({ length: 12 }, (_, index) => `Q${index + 1}`).every((key) => key in answers)
    : ["menarcheAgeYears", "cycleIrregular", "gap90", "skippedMonths", "hirsutism", "acnePersistent", "scalpThinning", "elevatedTestosterone", "weightHard", "rapidWeightGain", "acanthosis", "skinTags", "metabolicHistory", "familyPcos", "familyDiabetes", "lowActivity", "shortSleep", "unhealthyDiet", "hormonalMeds", "ultrasoundPcom", "amhTested", "moodConcern"].every((key) => key in answers);
  const validCycleIntervalCount = insights.cycleLengths.length;
  const confidence = assessConfidence({
    questionnaireComplete,
    hasBmi: assessment.bmi_at_assessment != null || Boolean(profile.height_cm && profile.weight_kg),
    periodLogCount: logs.length,
    validCycleIntervalCount,
    detailedPeriodLogCount: logs.filter((log) => log.duration_days != null && log.flow != null && log.pain_level != null).length,
    lifestyleBaselineComplete: Boolean(profile.activity_level && profile.exercise_frequency && profile.sleep_band && profile.stress_level != null),
  });
  const category = assessment.category as RiskCategory;
  const factors = (assessment.contributing_factors ?? []) as ContributingFactor[];
  const maxScore = isLegacy ? 20 : MAX_SCREEN_SCORE;

  return (
    <main className="mx-auto max-w-3xl space-y-6 bg-background pb-10 text-foreground print:max-w-none print:bg-white print:p-0 print:text-black">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5 print:border-black">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase print:text-black">P.R.O.M.I.S.E.</p>
          <h1 className="mt-1 text-2xl font-semibold">Doctor visit summary</h1>
          <p className="mt-1 text-sm text-muted-foreground print:text-neutral-700">Self-reported educational summary · generated {formatDate(new Date().toISOString())}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Link href={`/screen/result/${assessment.id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-accent">
            <ArrowLeft className="size-4" aria-hidden /> Result
          </Link>
          <PrintSummaryButton />
        </div>
      </header>

      <section className="rounded-2xl border border-border p-4 print:border-black">
        <h2 className="text-base font-semibold">Patient-provided details</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground print:text-neutral-700">Name</dt><dd className="font-medium">{profile.full_name}</dd></div>
          <div><dt className="text-muted-foreground print:text-neutral-700">Date of birth</dt><dd className="font-medium">{formatDate(profile.date_of_birth)}</dd></div>
          <div><dt className="text-muted-foreground print:text-neutral-700">Height</dt><dd className="font-medium">{profile.height_cm != null ? `${profile.height_cm} cm` : "Not recorded"}</dd></div>
          <div><dt className="text-muted-foreground print:text-neutral-700">Weight</dt><dd className="font-medium">{profile.weight_kg != null ? `${profile.weight_kg} kg` : "Not recorded"}</dd></div>
        </dl>
      </section>

      <section className="rounded-2xl border border-border p-4 print:border-black">
        <h2 className="text-base font-semibold">Participant-provided photo observations</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground print:text-neutral-700">Photos were processed transiently and were not stored. These educational observations do not alter the screening score and are not medical evidence, diagnosis, or severity assessment.</p>
        {photoAssessments?.length ? <ul className="mt-4 space-y-3">{photoAssessments.map((item) => <li key={item.id} className="rounded-xl bg-muted/50 p-3 text-sm print:border print:border-neutral-300 print:bg-white"><p className="font-medium">{formatDate(item.created_at)} · Image quality: {item.image_quality.replaceAll("_", " ")}</p><p className="mt-1">Acne-like spots: {item.acne_like_spots.replaceAll("_", " ")} · Coarse facial hair: {item.coarse_facial_hair.replaceAll("_", " ")}</p>{item.limitations?.length ? <p className="mt-1 text-xs text-muted-foreground print:text-neutral-700">Limitations: {item.limitations.join("; ")}</p> : null}</li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground print:text-neutral-700">No optional photo observations recorded.</p>}
      </section>

      <section className="rounded-2xl border border-border p-4 print:border-black">
        <h2 className="text-base font-semibold">PCOS educational screening</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground print:text-neutral-700">Screening date</dt><dd className="font-medium">{formatDate(assessment.created_at)}</dd></div>
          <div><dt className="text-muted-foreground print:text-neutral-700">Screening level</dt><dd className="font-medium">{category}</dd></div>
          <div><dt className="text-muted-foreground print:text-neutral-700">Score</dt><dd className="font-medium">{assessment.total_score}/{maxScore} points</dd></div>
          <div><dt className="text-muted-foreground print:text-neutral-700">BMI at screening</dt><dd className="font-medium">{assessment.bmi_at_assessment ?? "Not recorded"}</dd></div>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground print:text-neutral-700">{CATEGORY_COPY[category]}</p>
        <h3 className="mt-4 text-sm font-semibold">Contributing factors</h3>
        {factors.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{factors.map((factor) => <li key={factor.id}>{factor.label}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground print:text-neutral-700">No scored factors recorded.</p>}
      </section>

      <section className="rounded-2xl border border-border p-4 print:border-black">
        <h2 className="text-base font-semibold">Cycle history</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground print:text-neutral-700">Period logs included</dt><dd className="font-medium">{logs.length}</dd></div>
          <div><dt className="text-muted-foreground print:text-neutral-700">Average cycle length</dt><dd className="font-medium">{insights.avgCycleLength ? `${insights.avgCycleLength} days` : "Need more logs"}</dd></div>
          <div><dt className="text-muted-foreground print:text-neutral-700">Average period length</dt><dd className="font-medium">{insights.logCount ? `${insights.avgPeriodLength} days` : "Not available"}</dd></div>
          <div><dt className="text-muted-foreground print:text-neutral-700">Current estimate</dt><dd className="font-medium">{insights.phaseLabel}</dd></div>
        </dl>
        {logs.length ? <ul className="mt-4 grid gap-1 text-sm sm:grid-cols-2">{[...logs].reverse().map((log) => <li key={log.start_date}>Period start: {formatDate(log.start_date)}</li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground print:text-neutral-700">No period logs recorded.</p>}
      </section>

      <section className="rounded-2xl border border-border p-4 print:border-black">
        <h2 className="text-base font-semibold">Assessment data confidence</h2>
        <p className="mt-2 text-sm"><strong>{confidence.score}% · {confidence.band}</strong> — reliability of available screening context, not chance of having PCOS.</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{confidence.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      </section>

      <section className="rounded-2xl border border-border p-4 print:border-black">
        <h2 className="text-base font-semibold">Questions to discuss with a professional</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">{VISIT_QUESTIONS.map((question) => <li key={question}>{question}</li>)}</ol>
      </section>

      <footer className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground print:border-black print:text-neutral-700">
        This summary contains self-reported information for discussion with a qualified professional. It is educational only, not a diagnosis, medical record, or emergency service.
      </footer>
    </main>
  );
}
