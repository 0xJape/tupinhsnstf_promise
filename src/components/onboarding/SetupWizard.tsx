"use client";

import { useMemo, useState, useTransition } from "react";
import { Promi } from "@/components/promi/Promi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { finishOnboarding } from "@/app/(app)/onboarding/actions";
import {
  ACTIVITY_OPTIONS,
  ALCOHOL_OPTIONS,
  CONDITION_OPTIONS,
  emptyDraft,
  EXERCISE_OPTIONS,
  FAMILY_OPTIONS,
  SLEEP_OPTIONS,
  STEP_META,
  STRESS_OPTIONS,
  type OnboardingDraft,
} from "@/lib/onboarding/content";
import { cn } from "@/lib/utils";

type Props = {
  firstName: string;
  /** When true, dialog opens immediately (forced setup). */
  openByDefault?: boolean;
};

function toggleChip(
  list: string[],
  id: string,
  exclusiveNone = true,
): string[] {
  if (id === "none") return list.includes("none") ? [] : ["none"];
  const withoutNone = exclusiveNone ? list.filter((x) => x !== "none") : list;
  return withoutNone.includes(id)
    ? withoutNone.filter((x) => x !== id)
    : [...withoutNone, id];
}

function bmiPreview(height: string, weight: string) {
  const h = Number(height);
  const w = Number(weight);
  if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) return null;
  return (w / (h / 100) ** 2).toFixed(1);
}

export function SetupWizard({ firstName, openByDefault = true }: Props) {
  const [open, setOpen] = useState(openByDefault);
  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = Number(window.sessionStorage.getItem("promise-onboarding-step"));
    return Number.isInteger(saved) && saved >= 0 && saved < STEP_META.length ? saved : 0;
  });
  const [draft, setDraft] = useState<OnboardingDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const meta = STEP_META[step];
  const progress = ((step + 1) / STEP_META.length) * 100;
  const bmi = useMemo(
    () => bmiPreview(draft.height_cm, draft.weight_kg),
    [draft.height_cm, draft.weight_kg],
  );

  function setField<K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setError(null);
  }

  function canNext(): string | null {
    switch (STEP_META[step].id) {
      case "body": {
        const h = Number(draft.height_cm);
        const w = Number(draft.weight_kg);
        if (!Number.isFinite(h) || h < 100 || h > 250) {
          return "Enter height in cm (about 100–250).";
        }
        if (!Number.isFinite(w) || w < 25 || w > 300) {
          return "Enter weight in kg (about 25–300).";
        }
        return null;
      }
      case "family":
        return draft.family_history.length ? null : "Pick at least one family option (or None).";
      case "conditions":
        return draft.conditions.length ? null : "Pick what applies (or None).";
      case "lifestyle":
        if (!draft.activity_level) return "Choose your usual activity level.";
        if (!draft.exercise_frequency) return "Choose exercise frequency.";
        if (!draft.sleep_band) return "Choose a sleep band.";
        return null;
      case "stress":
        return draft.stress_level ? null : "Pick a stress level 1–5.";
      case "habits":
        if (draft.smoking !== "true" && draft.smoking !== "false") {
          return "Tell us about smoking (yes or no).";
        }
        if (!draft.alcohol_band) return "Choose an alcohol option.";
        return null;
      default:
        return null;
    }
  }

  function next() {
    const msg = canNext();
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setStep((s) => {
      const nextStep = Math.min(s + 1, STEP_META.length - 1);
      window.sessionStorage.setItem("promise-onboarding-step", String(nextStep));
      return nextStep;
    });
  }

  function back() {
    setError(null);
    setStep((s) => {
      const nextStep = Math.max(s - 1, 0);
      window.sessionStorage.setItem("promise-onboarding-step", String(nextStep));
      return nextStep;
    });
  }

  function submit() {
    const msg = canNext();
    if (msg) {
      setError(msg);
      return;
    }
    startTransition(async () => {
      const res = await finishOnboarding(draft);
      if (res?.error) setError(res.error);
      else window.sessionStorage.removeItem("promise-onboarding-step");
    });
  }

  return (
    <>
      {!open ? (
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium">Setup not finished</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Answer a short guided tour so tips and screening fit you better.
          </p>
          <Button
            type="button"
            className="mt-3 min-h-11 w-full rounded-xl"
            onClick={() => {
              setOpen(true);
              setStep(0);
            }}
          >
            Continue setup
          </Button>
        </div>
      ) : null}

      <Dialog
        open={open}
        disablePointerDismissal={openByDefault}
        onOpenChange={(nextOpen) => {
          // Forced path: allow close only after complete (redirect). Soft reopen via card.
          if (!nextOpen && openByDefault) return;
          setOpen(nextOpen);
        }}
      >
        <DialogContent
          showCloseButton={!openByDefault}
          className="flex max-h-[min(92vh,720px)] w-full max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        >
          <div className="border-b border-border/70 px-4 pt-4 pb-3">
            <DialogHeader className="gap-1">
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                Step {step + 1} of {STEP_META.length} · {meta.short}
              </p>
              <DialogTitle className="text-lg">{meta.title}</DialogTitle>
              <DialogDescription className="sr-only">
                Guided profile setup wizard
              </DialogDescription>
            </DialogHeader>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
              aria-hidden
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {error ? (
              <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            {meta.id === "welcome" ? (
              <div className="space-y-3">
                <Promi
                  emotion="wave"
                  size="sm"
                  line={`Hi ${firstName || "there"} — before home, let’s set up your health baseline together. One calm question at a time.`}
                />
                <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">Why:</span>{" "}
                    height, lifestyle, and history help BMI, tips, and screening
                    context — not a diagnosis.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">How long:</span>{" "}
                    about 3–5 minutes. You can edit later in Profile.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Privacy:</span>{" "}
                    answers stay on your account only.
                  </li>
                </ul>
              </div>
            ) : null}

            {meta.id === "body" ? (
              <div className="space-y-4">
                <Explain
                  title="Why body measurements?"
                  body="Height and weight let us show BMI (a rough size-for-height number). Waist is optional but useful for metabolic context. Numbers are tools for education — not a verdict on your worth."
                />
                <Field label="Height (cm)" htmlFor="ob_height">
                  <Input
                    id="ob_height"
                    inputMode="decimal"
                    value={draft.height_cm}
                    onChange={(e) => setField("height_cm", e.target.value)}
                    placeholder="e.g. 160"
                    className="min-h-11 rounded-xl"
                  />
                </Field>
                <Field label="Weight (kg)" htmlFor="ob_weight">
                  <Input
                    id="ob_weight"
                    inputMode="decimal"
                    value={draft.weight_kg}
                    onChange={(e) => setField("weight_kg", e.target.value)}
                    placeholder="e.g. 55"
                    className="min-h-11 rounded-xl"
                  />
                </Field>
                <Field label="Waist (cm) — optional" htmlFor="ob_waist">
                  <Input
                    id="ob_waist"
                    inputMode="decimal"
                    value={draft.waist_cm}
                    onChange={(e) => setField("waist_cm", e.target.value)}
                    placeholder="Measure at navel if you can"
                    className="min-h-11 rounded-xl"
                  />
                </Field>
                {bmi ? (
                  <p className="rounded-2xl bg-muted/80 px-3 py-2 text-sm">
                    Live BMI preview: <strong>{bmi}</strong> (updates as you type)
                  </p>
                ) : null}
              </div>
            ) : null}

            {meta.id === "family" ? (
              <div className="space-y-3">
                <Explain
                  title="Why family history?"
                  body="Some hormone and metabolic patterns run in families. Pick anything a parent, sibling, or grandparent has had — or “not sure.” This never diagnoses you."
                />
                <ChipGroup
                  options={FAMILY_OPTIONS}
                  selected={draft.family_history}
                  onToggle={(id) =>
                    setField("family_history", toggleChip(draft.family_history, id))
                  }
                />
              </div>
            ) : null}

            {meta.id === "conditions" ? (
              <div className="space-y-3">
                <Explain
                  title="What you’ve noticed in yourself"
                  body="These are common reasons people explore PCOS education. Select all that feel true. “None” is valid — you can still track cycles and learn."
                />
                <ChipGroup
                  options={CONDITION_OPTIONS}
                  selected={draft.conditions}
                  onToggle={(id) =>
                    setField("conditions", toggleChip(draft.conditions, id))
                  }
                />
              </div>
            ) : null}

            {meta.id === "lifestyle" ? (
              <div className="space-y-5">
                <Explain
                  title="Daily rhythm"
                  body="Movement and sleep shape energy, mood, and sometimes cycles. Choose the option closest to a normal week — not your perfect week."
                />
                <OptionList
                  legend="Usual activity"
                  options={ACTIVITY_OPTIONS}
                  value={draft.activity_level}
                  onChange={(v) => setField("activity_level", v)}
                />
                <OptionList
                  legend="Planned exercise"
                  options={EXERCISE_OPTIONS}
                  value={draft.exercise_frequency}
                  onChange={(v) => setField("exercise_frequency", v)}
                />
                <OptionList
                  legend="Typical sleep"
                  options={SLEEP_OPTIONS}
                  value={draft.sleep_band}
                  onChange={(v) => setField("sleep_band", v)}
                />
              </div>
            ) : null}

            {meta.id === "stress" ? (
              <div className="space-y-3">
                <Explain
                  title="Stress is health data too"
                  body="Stress can affect sleep, appetite, and periods. Rate how life has felt lately (not just today). High stress is common — this is a check-in, not a test."
                />
                <OptionList
                  legend="Stress level (1–5)"
                  options={STRESS_OPTIONS.map((o) => ({
                    value: String(o.value),
                    label: o.label,
                    why: o.why,
                  }))}
                  value={draft.stress_level}
                  onChange={(v) => setField("stress_level", v)}
                />
              </div>
            ) : null}

            {meta.id === "habits" ? (
              <div className="space-y-5">
                <Explain
                  title="Smoking & alcohol"
                  body="These affect heart, hormones, and recovery. Answer honestly — only you see this on your profile. Under legal drinking age? Choose “I don’t drink.”"
                />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Do you smoke or vape nicotine?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["false", "No"],
                        ["true", "Yes"],
                      ] as const
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setField("smoking", val)}
                        className={cn(
                          "min-h-11 rounded-xl border px-3 text-sm font-medium transition",
                          draft.smoking === val
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/80 hover:bg-muted/60",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nicotine can affect circulation and healing. “Yes” just flags lifestyle context.
                  </p>
                </div>
                <OptionList
                  legend="Alcohol"
                  options={ALCOHOL_OPTIONS}
                  value={draft.alcohol_band}
                  onChange={(v) => setField("alcohol_band", v)}
                />
              </div>
            ) : null}

            {meta.id === "contact" ? (
              <div className="space-y-4">
                <Explain
                  title="Optional mobile for SMS"
                  body="Reminders (period log, follow-ups) can use email and SMS. Mobile is optional now — you can add it later. SMS stays off until you enable it in Notifications."
                />
                <Field label="Mobile number (optional)" htmlFor="ob_mobile">
                  <Input
                    id="ob_mobile"
                    type="tel"
                    value={draft.mobile_number}
                    onChange={(e) => setField("mobile_number", e.target.value)}
                    placeholder="+63…"
                    className="min-h-11 rounded-xl"
                  />
                </Field>
              </div>
            ) : null}

            {meta.id === "review" ? (
              <div className="space-y-3">
                <Promi
                  emotion="happy"
                  size="sm"
                  line="Almost done. Check this summary — then we unlock your care hub."
                />
                <ul className="space-y-2 rounded-2xl border border-border/80 bg-muted/40 p-3 text-sm">
                  <li>
                    Body: {draft.height_cm} cm · {draft.weight_kg} kg
                    {draft.waist_cm ? ` · waist ${draft.waist_cm} cm` : ""}
                    {bmi ? ` · BMI ~${bmi}` : ""}
                  </li>
                  <li>Family: {draft.family_history.join(", ") || "—"}</li>
                  <li>Noticed: {draft.conditions.join(", ") || "—"}</li>
                  <li>
                    Activity {draft.activity_level} · exercise{" "}
                    {draft.exercise_frequency} · sleep {draft.sleep_band}
                  </li>
                  <li>
                    Stress {draft.stress_level}/5 · smoking{" "}
                    {draft.smoking === "true" ? "yes" : "no"} · alcohol{" "}
                    {draft.alcohol_band}
                  </li>
                  <li>Mobile: {draft.mobile_number || "skipped"}</li>
                </ul>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  P.R.O.M.I.S.E. is educational and not a medical diagnosis. You can
                  change answers anytime under Profile.
                </p>
              </div>
            ) : null}
          </div>

          <DialogFooter className="mx-0 mb-0 flex-row gap-2 border-t p-4 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 rounded-xl"
              disabled={step === 0 || pending}
              onClick={back}
            >
              Back
            </Button>
            {meta.id === "review" ? (
              <Button
                type="button"
                className="min-h-11 flex-1 rounded-xl sm:flex-none"
                disabled={pending}
                onClick={submit}
              >
                {pending ? "Saving…" : "Finish setup"}
              </Button>
            ) : (
              <Button
                type="button"
                className="min-h-11 flex-1 rounded-xl sm:flex-none"
                onClick={next}
              >
                Continue
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Explain({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-primary/15 bg-primary/5 px-3 py-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: readonly { id: string; label: string; why: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {options.map((opt) => {
        const on = selected.includes(opt.id);
        return (
          <li key={opt.id}>
            <button
              type="button"
              onClick={() => onToggle(opt.id)}
              className={cn(
                "w-full rounded-2xl border px-3 py-3 text-left transition",
                on
                  ? "border-primary bg-primary/10"
                  : "border-border/80 hover:bg-muted/50",
              )}
            >
              <span className="text-sm font-medium">{opt.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {opt.why}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function OptionList({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: readonly { value: string; label: string; why: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <ul className="space-y-2">
        {options.map((opt) => {
          const on = value === opt.value;
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  "w-full rounded-2xl border px-3 py-3 text-left transition",
                  on
                    ? "border-primary bg-primary/10"
                    : "border-border/80 hover:bg-muted/50",
                )}
              >
                <span className="text-sm font-medium">{opt.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {opt.why}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
