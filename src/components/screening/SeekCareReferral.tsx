"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  assessmentId: string;
};

export function SeekCareReferral({ assessmentId }: Props) {
  const [consent, setConsent] = useState(false);
  const [note, setNote] = useState("");
  const [scheduleCall, setScheduleCall] = useState(false);
  const [preferredCallAt, setPreferredCallAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit() {
    if (!consent || busy) return;
    if (scheduleCall && (!preferredCallAt || new Date(preferredCallAt).getTime() <= Date.now())) {
      setError("Choose a future date and time.");
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/referrals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          consentShare: true,
          note: note.trim() || undefined,
          preferredCallAt: scheduleCall ? preferredCallAt : undefined,
          timeZone: scheduleCall
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : undefined,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        skipped?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.message ?? json.error ?? "Could not send referral.");
        return;
      }
      setDone(true);
      setInfo(json.message ?? "Referral request submitted.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/70 px-4 py-3.5">
        <CheckCircle2
          className="mt-0.5 size-5 shrink-0 text-emerald-700"
          aria-hidden
        />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-emerald-950">Referral requested</p>
          <p className="leading-relaxed text-emerald-950/80">
            {info ??
              "Your screening summary was submitted to the care team. This is not a diagnosis."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-border px-4 py-4 sm:px-5">
      <div className="flex gap-2.5">
        <Stethoscope className="mt-0.5 size-4 shrink-0 text-amber-800" aria-hidden />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-950">
            Request care team follow-up
          </p>
          <p className="text-xs leading-relaxed text-amber-950/75">
            If you want help seeking care, we can send your name, contact
            details, and this screening summary to our dedicated care desk
            (email/SMS). You choose — nothing is sent until you confirm.
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer gap-2.5 rounded-2xl glass-chip px-3 py-2.5 text-sm text-amber-950">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 accent-amber-700"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span className="leading-relaxed">
          I agree to share my profile contact details and this screening result
          with the P.R.O.M.I.S.E. care desk for referral support. Not a
          diagnosis.
        </span>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-amber-950/80">
          Optional note for the care team
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          rows={2}
          placeholder="Symptoms or concerns you want to discuss…"
          className="w-full resize-none rounded-2xl border border-amber-200/50 bg-card px-3 py-2 text-sm text-amber-950 outline-none ring-amber-400/40 placeholder:text-amber-950/40 focus:ring-2 dark:border-amber-500/30 dark:text-amber-100 dark:placeholder:text-amber-100/40"
        />
      </label>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-amber-950 dark:text-amber-100">
          <input
            type="checkbox"
            className="size-4 shrink-0 accent-amber-700"
            checked={scheduleCall}
            onChange={(e) => {
              setScheduleCall(e.target.checked);
              if (!e.target.checked) setPreferredCallAt("");
            }}
          />
          Choose a preferred callback time
        </label>

        {scheduleCall ? (
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-amber-950/80">
              Preferred date and time
            </span>
            <input
              type="datetime-local"
              value={preferredCallAt}
              onChange={(e) => setPreferredCallAt(e.target.value)}
              required
              className="w-full rounded-2xl border border-amber-200/50 bg-card px-3 py-2.5 text-sm text-amber-950 outline-none ring-amber-400/40 focus:ring-2 dark:border-amber-500/30 dark:text-amber-100"
            />
            <span className="block text-[11px] leading-relaxed text-amber-950/60 dark:text-amber-100/60">
              Local time. Exact availability may vary.
            </span>
          </label>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        size="lg"
        disabled={!consent || (scheduleCall && !preferredCallAt) || busy}
        onClick={() => void submit()}
        className="w-full rounded-2xl bg-amber-800 text-white hover:bg-amber-900 disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          "Send referral to care team"
        )}
      </Button>
    </div>
  );
}
