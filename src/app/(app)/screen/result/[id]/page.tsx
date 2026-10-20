import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  Home,
  Info,
  MessageCircle,
  Pill,
  Scale,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { RiskBadge } from "@/components/screening/RiskBadge";
import { ScoreRing } from "@/components/screening/ScoreRing";
import { ReferralPrompt } from "@/components/screening/ReferralPrompt";
import { buttonVariants } from "@/components/ui/button";
import {
  CATEGORY_COPY,
  REFERRAL_CHECKLIST,
  VISIT_QUESTIONS,
} from "@/lib/screening/content";
import { assessConfidence } from "@/lib/screening/confidence";
import { MAX_SCREEN_SCORE } from "@/lib/rules/pcosScreen";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { ContributingFactor, RiskCategory } from "@/types/screening";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string }>;
};

const barFill: Record<RiskCategory, string> = {
  Low: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  Moderate: "bg-gradient-to-r from-amber-400 to-amber-600",
  High: "bg-gradient-to-r from-rose-400 to-rose-600",
};

export default async function ScreenResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { submitted } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("risk_assessments")
    .select(
      "id, category, total_score, contributing_factors, referral_recommended, bmi_at_assessment, rule_version, created_at, answers",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row) notFound();

  const [{ data: profile }, { data: periodLogs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("height_cm, weight_kg, activity_level, exercise_frequency, sleep_band, stress_level")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("menstrual_logs")
      .select("start_date, duration_days, flow, pain_level")
      .eq("user_id", user.id)
      .order("start_date", { ascending: true }),
  ]);

  const category = row.category as RiskCategory;
  const factors = (row.contributing_factors ?? []) as ContributingFactor[];
  const answers = (row.answers ?? {}) as Record<string, unknown>;
  const isLegacy = row.rule_version === "pcos-screen-v1";
  const questionnaireComplete = isLegacy
    ? Array.from({ length: 12 }, (_, i) => `Q${i + 1}`).every((key) => key in answers)
    : [
        "menarcheAgeYears",
        "cycleIrregular",
        "gap90",
        "skippedMonths",
        "hirsutism",
        "acnePersistent",
        "scalpThinning",
        "elevatedTestosterone",
        "weightHard",
        "rapidWeightGain",
        "acanthosis",
        "skinTags",
        "metabolicHistory",
        "familyPcos",
        "familyDiabetes",
        "lowActivity",
        "shortSleep",
        "unhealthyDiet",
        "hormonalMeds",
        "ultrasoundPcom",
        "amhTested",
        "moodConcern",
      ].every((key) => key in answers);
  const logs = periodLogs ?? [];
  const validCycleIntervalCount = logs.slice(1).filter((log, index) => {
    const prior = logs[index];
    const days =
      (new Date(log.start_date).getTime() - new Date(prior.start_date).getTime()) /
      86_400_000;
    return days >= 15 && days <= 90;
  }).length;
  const confidence = assessConfidence({
    questionnaireComplete,
    hasBmi: row.bmi_at_assessment != null || Boolean(profile?.height_cm && profile.weight_kg),
    periodLogCount: logs.length,
    validCycleIntervalCount,
    detailedPeriodLogCount: logs.filter(
      (log) => log.duration_days != null && log.flow != null && log.pain_level != null,
    ).length,
    lifestyleBaselineComplete: Boolean(
      profile?.activity_level &&
        profile.exercise_frequency &&
        profile.sleep_band &&
        profile.stress_level != null,
    ),
  });
  const hormonalMeds = Boolean(
    answers.hormonalMeds ?? answers.Q12 /* legacy v1 */,
  );
  const moodFlag = Boolean(answers.moodConcern);
  const imagingNote = Boolean(answers.ultrasoundPcom || answers.amhTested);
  const when = new Date(row.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const maxScore = isLegacy ? 20 : MAX_SCREEN_SCORE;
  const maxFactorPts = Math.max(1, ...factors.map((f) => f.points), 1);

  return (
    <div className="result-stage space-y-4 sm:space-y-5 -mx-1">
      <header className="glass-rise flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Link
            href="/screen"
            className="inline-flex items-center gap-1.5 rounded-full glass-chip px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Screening
          </Link>
          <div className="space-y-1">
            <p className="section-label text-primary/90">Result · {when}</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-[2rem]">
              Your screening
            </h1>
          </div>
        </div>
        <RiskBadge category={category} size="lg" className="glass-chip shadow-none" />
      </header>

      {/* Hero glass */}
      <section className="glass-strong glass-rise glass-rise-delay-1 rounded-[1.35rem] p-5 sm:p-7">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          <ScoreRing
            score={row.total_score}
            maxScore={maxScore}
            category={category}
            className="shrink-0"
          />
          <div className="w-full min-w-0 space-y-4 text-center sm:text-left">
            <div className="space-y-1.5">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                <Sparkles className="size-3.5 text-primary" aria-hidden />
                Screening level
              </p>
              <p className="text-3xl font-semibold tracking-tight">{category} risk</p>
              <p className="text-sm text-muted-foreground">
                Educational score · not a diagnosis · {row.rule_version}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {([
                {
                  label: "Score",
                  value: (
                    <>
                      {row.total_score}
                      <span className="text-xs font-medium text-muted-foreground">
                        /{maxScore}
                      </span>
                    </>
                  ),
                },
                { label: "Level", value: category },
                { label: "Factors", value: String(factors.length) },
              ]).map((stat) => (
                <div
                  key={stat.label}
                  className="glass-chip rounded-2xl px-2.5 py-3 text-left"
                >
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {row.bmi_at_assessment != null ? (
              <p className="inline-flex items-center gap-1.5 rounded-full glass-chip px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Scale className="size-3.5" aria-hidden />
                BMI {row.bmi_at_assessment}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="glass-rise glass-rise-delay-2">
        <DisclaimerBanner
          compact
          className="border-border bg-card/70 shadow-none backdrop-blur-xl"
        />
      </div>

      <section className="glass glass-rise glass-rise-delay-2 rounded-[1.25rem] p-4 sm:p-5">
        <div className="flex gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl glass-chip text-primary">
            <ClipboardList className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1.5">
            <p className="section-label text-primary">Assessment data confidence</p>
            <p className="text-lg font-semibold tracking-tight">
              {confidence.score}% · {confidence.band}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Reliability of available screening context — not a chance of having PCOS.
            </p>
          </div>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {confidence.reasons.map((reason) => (
            <li
              key={reason}
              className="flex gap-2 rounded-2xl glass-chip px-3 py-2 text-xs leading-relaxed text-muted-foreground"
            >
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              {reason}
            </li>
          ))}
        </ul>
      </section>

      {/* Meaning */}
      <section className="glass glass-rise glass-rise-delay-2 rounded-[1.25rem] p-4 sm:p-5">
        <div className="flex gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl glass-chip text-primary">
            <Info className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1.5">
            <p className="section-label text-primary">What this means</p>
            <p className="text-sm leading-relaxed text-foreground/90">
              {CATEGORY_COPY[category]}
            </p>
          </div>
        </div>
        {hormonalMeds ? (
          <div className="mt-4 flex gap-2.5 rounded-2xl glass-chip px-3 py-2.5">
            <Pill className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Hormonal contraception / cycle meds marked. Cycle answers may look
              different — mention this to a clinician.
            </p>
          </div>
        ) : null}
        {imagingNote ? (
          <div className="mt-3 flex gap-2.5 rounded-2xl glass-chip px-3 py-2.5">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Ultrasound / AMH noted for education only — not used in this
              adolescent risk score (guideline).
            </p>
          </div>
        ) : null}
        {moodFlag ? (
          <div className="mt-3 flex gap-2.5 rounded-2xl glass-chip px-3 py-2.5">
            <MessageCircle
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Mood concern flagged (0 PCOS points). Consider support from a
              trusted adult or professional if it continues.
            </p>
          </div>
        ) : null}
      </section>

      {/* Factors */}
      <section className="glass-rise glass-rise-delay-3 space-y-3">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <h2 className="section-label">Contributing factors</h2>
          {factors.length > 0 ? (
            <span className="rounded-full glass-chip px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {factors.length} item{factors.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {!factors.length ? (
          <div className="glass flex items-center gap-3 rounded-[1.25rem] px-4 py-5">
            <ClipboardList
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">
              No scored factors (all No, BMI under thresholds or missing).
            </p>
          </div>
        ) : (
          <ul className="glass divide-y divide-border overflow-hidden rounded-[1.25rem]">
            {factors.map((f) => {
              const width = Math.max(
                14,
                Math.round((f.points / maxFactorPts) * 100),
              );
              return (
                <li key={f.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-snug">{f.label}</p>
                    <span className="shrink-0 rounded-full glass-chip px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
                      +{f.points}
                    </span>
                  </div>
                  <div className="glass-bar mt-2.5" aria-hidden>
                    <span
                      className={barFill[category]}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Referral */}
      {row.referral_recommended ? (
        <section className="glass-strong overflow-hidden rounded-[1.35rem] border-amber-200/50">
          <div className="flex gap-3 border-b border-border p-4 sm:p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100/80 text-amber-900 shadow-sm">
              <Stethoscope className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="section-label text-amber-900">Recommended next step</p>
              <h2 className="text-lg font-semibold tracking-tight text-amber-950">
                Talk to a professional
              </h2>
              <p className="text-sm leading-relaxed text-amber-950/75">
                Moderate / High always include referral support. Guidance only.
              </p>
            </div>
          </div>

          <details className="group border-b border-border">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3.5 text-sm font-semibold text-amber-950 sm:px-5 [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-amber-700" aria-hidden />
                Prepare for your visit
              </span>
              <ChevronDown
                className="size-4 shrink-0 text-amber-800 transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <ul className="space-y-2 px-4 pb-4 sm:px-5">
              {REFERRAL_CHECKLIST.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 rounded-2xl glass-chip px-3 py-2.5 text-sm leading-relaxed text-amber-950"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-600"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3.5 text-sm font-semibold text-amber-950 sm:px-5 [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="size-4 text-amber-700" aria-hidden />
                Questions you can ask
              </span>
              <ChevronDown
                className="size-4 shrink-0 text-amber-800 transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <ol className="space-y-2 px-4 pb-4 sm:px-5">
              {VISIT_QUESTIONS.map((q, i) => (
                <li
                  key={q}
                  className="flex gap-3 rounded-2xl glass-chip px-3 py-2.5 text-sm leading-relaxed text-amber-950"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100/90 text-xs font-semibold text-amber-900">
                    {i + 1}
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          </details>

          <div className="border-t border-border p-4 sm:p-5"><ReferralPrompt assessmentId={row.id} initialOpen={submitted === "1"} /></div>
        </section>
      ) : (
        <section className="glass flex gap-3 rounded-[1.25rem] p-4">
          <CheckCircle2
            className="mt-0.5 size-5 shrink-0 text-emerald-600"
            aria-hidden
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Seek care if symptoms worry you or worsen. Cycle tracking still
            helps you notice patterns.
          </p>
        </section>
      )}

      {/* Actions */}
      <section className="space-y-3" aria-label="Next actions">
        <h2 className="section-label px-0.5">What next</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/assistant"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-auto min-h-24 flex-col items-start justify-center gap-1.5 rounded-2xl px-5 py-4 text-left shadow-lg shadow-primary/15",
            )}
          >
            <span className="inline-flex items-center gap-2 font-semibold">
              <MessageCircle className="size-4" aria-hidden />
              Explain with AI
            </span>
            <span className="text-xs font-normal opacity-85">
              Educational chat
            </span>
          </Link>
          <Link
            href="/cycle"
            className="glass flex min-h-24 flex-col items-start justify-center gap-1.5 rounded-2xl px-5 py-4 text-left transition hover:bg-accent"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="size-4" aria-hidden />
              Log period
            </span>
            <span className="text-xs text-muted-foreground">
              Build cycle history
            </span>
          </Link>
          <Link
            href={`/screen/result/${row.id}/summary`}
            className="glass flex min-h-24 flex-col items-start justify-center gap-1.5 rounded-2xl px-5 py-4 text-left transition hover:bg-accent"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <FileText className="size-4" aria-hidden />
              Doctor summary
            </span>
            <span className="text-xs text-muted-foreground">
              Print or save PDF
            </span>
          </Link>
          <Link
            href="/home"
            className="glass flex min-h-24 flex-col items-start justify-center gap-1.5 rounded-2xl px-5 py-4 text-left transition hover:bg-accent"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Home className="size-4" aria-hidden />
              Home
            </span>
            <span className="text-xs text-muted-foreground">Back to hub</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
