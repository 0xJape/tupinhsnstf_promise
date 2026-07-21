"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  QUESTION_HINTS,
  QUESTION_PROMPTS,
  QUIZ_GROUPS,
} from "@/lib/screening/content";
import { BOOLEAN_QUESTION_IDS, QUESTION_LABELS } from "@/lib/rules/pcosScreen";
import { cn } from "@/lib/utils";
import type { BooleanQuestionId, ScreeningAnswers } from "@/types/screening";

type Props = {
  heightCm?: number | null;
  weightKg?: number | null;
  bmi?: number | null;
  ageYears?: number | null;
};

export function ScreeningQuiz({ heightCm, weightKg, bmi, ageYears }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<ScreeningAnswers>>({});
  const [menarche, setMenarche] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isReview = step >= QUIZ_GROUPS.length;
  const group = !isReview ? QUIZ_GROUPS[step] : null;

  const menarcheNum = Number(menarche);
  const menarcheOk =
    Number.isFinite(menarcheNum) && menarcheNum >= 8 && menarcheNum <= 18;

  const answeredCount = useMemo(
    () =>
      BOOLEAN_QUESTION_IDS.filter((id) => typeof answers[id] === "boolean")
        .length + (menarcheOk ? 1 : 0),
    [answers, menarcheOk],
  );
  const totalItems = BOOLEAN_QUESTION_IDS.length + 1;

  const groupComplete =
    (group?.questions.every((id) => typeof answers[id] === "boolean") ??
      false) &&
    (!group?.includeMenarche || menarcheOk);

  const allComplete =
    BOOLEAN_QUESTION_IDS.every((id) => typeof answers[id] === "boolean") &&
    menarcheOk;

  function setAnswer(id: BooleanQuestionId, value: boolean) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setError(null);
  }

  async function submit() {
    if (!allComplete) {
      setError("Answer every question before submitting.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        answers: {
          menarcheAgeYears: menarcheNum,
          ...Object.fromEntries(
            BOOLEAN_QUESTION_IDS.map((id) => [id, Boolean(answers[id])]),
          ),
        },
      };
      if (heightCm != null && heightCm > 0) body.heightCm = heightCm;
      if (weightKg != null && weightKg > 0) body.weightKg = weightKg;
      if (bmi != null && bmi > 0) body.bmi = bmi;
      if (ageYears != null && ageYears > 0) body.ageYears = ageYears;

      const res = await fetch("/api/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        id?: string;
        error?: string;
      };
      if (!res.ok || !data.id) {
        throw new Error(data.error ?? "Could not save screening");
      }
      router.push(`/screen/result/${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
      setSubmitting(false);
    }
  }

  const progressPct = Math.round(
    ((isReview ? totalItems : answeredCount) / totalItems) * 100,
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="font-medium">
            {isReview
              ? "Review"
              : `Group ${step + 1} of ${QUIZ_GROUPS.length}`}
          </span>
          <span>
            {answeredCount} of {totalItems} answered
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {group ? (
        <section className="space-y-4" aria-labelledby="quiz-group-title">
          <header className="space-y-1">
            <p className="section-label text-primary">{group.title}</p>
            <h2
              id="quiz-group-title"
              className="text-xl font-semibold tracking-tight"
            >
              {group.blurb}
            </h2>
          </header>

          <ul className="space-y-3">
            {group.includeMenarche ? (
              <li className="surface-card p-4">
                <label
                  htmlFor="menarcheAgeYears"
                  className="text-sm font-medium leading-relaxed"
                >
                  How old were you when your first period started?
                </label>
                {QUESTION_HINTS.menarcheAgeYears ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {QUESTION_HINTS.menarcheAgeYears}
                  </p>
                ) : null}
                <Input
                  id="menarcheAgeYears"
                  type="number"
                  inputMode="decimal"
                  min={8}
                  max={18}
                  step={0.5}
                  value={menarche}
                  onChange={(e) => {
                    setMenarche(e.target.value);
                    setError(null);
                  }}
                  className="mt-3 min-h-12 rounded-xl"
                  placeholder="e.g. 12"
                />
              </li>
            ) : null}
            {group.questions.map((id) => (
              <li key={id} className="surface-card p-4">
                <p className="text-sm font-medium leading-relaxed">
                  {QUESTION_PROMPTS[id]}
                </p>
                {QUESTION_HINTS[id] ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {QUESTION_HINTS[id]}
                  </p>
                ) : null}
                <div
                  className="mt-3 grid grid-cols-2 gap-2"
                  role="group"
                  aria-label={QUESTION_LABELS[id]}
                >
                  <YesNoButton
                    selected={answers[id] === true}
                    onClick={() => setAnswer(id, true)}
                    label="Yes"
                  />
                  <YesNoButton
                    selected={answers[id] === false}
                    onClick={() => setAnswer(id, false)}
                    label="No"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="space-y-4" aria-labelledby="quiz-review-title">
          <header className="space-y-1">
            <p className="section-label text-primary">Almost done</p>
            <h2
              id="quiz-review-title"
              className="text-xl font-semibold tracking-tight"
            >
              Review answers
            </h2>
            <p className="text-sm text-muted-foreground">
              Score uses fixed rules only — not AI.
            </p>
          </header>

          <div className="surface-card overflow-hidden divide-y divide-border">
            <div className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">
                  {QUESTION_LABELS.menarcheAgeYears}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {menarcheNum}
              </span>
            </div>
            {BOOLEAN_QUESTION_IDS.map((id) => (
              <div
                key={id}
                className="flex items-start justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">
                    {QUESTION_LABELS[id]}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {QUESTION_PROMPTS[id]}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                    answers[id]
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {answers[id] ? "Yes" : "No"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {error ? (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 flex-1 rounded-xl"
          disabled={step === 0 || submitting}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Button>

        {!isReview ? (
          <Button
            type="button"
            size="lg"
            className="min-h-11 flex-1 rounded-xl"
            disabled={!groupComplete}
            onClick={() => setStep((s) => s + 1)}
          >
            Next
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            className="min-h-11 flex-1 rounded-xl"
            disabled={!allComplete || submitting}
            onClick={submit}
          >
            {submitting ? "Scoring…" : "Submit"}
            <Check className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}

function YesNoButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "min-h-12 rounded-[20px] text-sm font-bold active:scale-[0.94]",
        selected
          ? "bg-primary text-primary-foreground shadow-[10px_10px_20px_rgba(159,41,71,0.28),inset_2px_2px_6px_rgba(255,255,255,0.35)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.28)]"
          : "bg-card text-foreground shadow-[10px_10px_20px_rgba(160,150,180,0.18),-6px_-6px_14px_rgba(255,255,255,0.9)] hover:bg-accent dark:shadow-[6px_6px_14px_rgba(0,0,0,0.28)]",
      )}
    >
      {label}
    </button>
  );
}