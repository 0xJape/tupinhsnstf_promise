import { computeCycleInsights } from "@/lib/cycle/insights";
import { createAdminClient } from "@/lib/supabase/admin";
import { emitMakeEvent } from "./emit";
import type { MakeEventType } from "./types";

export type ReminderRunSummary = {
  scanned: number;
  sent: number;
  skipped: number;
  failed: number;
  byType: Record<string, number>;
};

const PERIOD_WINDOW_DAYS = 3; // remind when next period within 0..3 days
const MISSED_DELAY_DAYS = 3; // delayed past expected start
const MISSED_NO_LOG_DAYS = 35; // no log at all for this long

/**
 * Scan users and emit period / missed / weekly education events.
 * Safe to run daily via cron.
 */
export async function runReminderScan(now = new Date()): Promise<ReminderRunSummary> {
  const admin = createAdminClient();
  const summary: ReminderRunSummary = {
    scanned: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    byType: {},
  };

  const bump = (type: MakeEventType | "other", kind: "sent" | "skipped" | "failed") => {
    summary[kind] += 1;
    summary.byType[type] = (summary.byType[type] ?? 0) + 1;
  };

  const { data: prefsList, error } = await admin
    .from("notification_preferences")
    .select(
      "user_id, email_enabled, sms_enabled, period_reminders, missed_log_reminders, education_tips",
    )
    .or(
      "period_reminders.eq.true,missed_log_reminders.eq.true,education_tips.eq.true",
    );

  if (error) {
    console.error("reminder prefs", error.message);
    return summary;
  }

  const weekday = now.getUTCDay(); // 0 Sun — weekly tip on Monday UTC
  const isEducationDay = weekday === 1;

  for (const prefs of prefsList ?? []) {
    summary.scanned += 1;
    const userId = prefs.user_id as string;

    const { data: logs } = await admin
      .from("menstrual_logs")
      .select("id, start_date, duration_days")
      .eq("user_id", userId)
      .order("start_date", { ascending: true })
      .limit(24);

    const insights = computeCycleInsights(
      (logs ?? []).map((l) => ({
        id: l.id,
        start_date: l.start_date,
        duration_days: l.duration_days,
      })),
      now,
    );

    // Period window reminder
    if (
      prefs.period_reminders &&
      insights.nextExpectedStart != null &&
      insights.daysUntilExpected != null &&
      insights.daysUntilExpected >= 0 &&
      insights.daysUntilExpected <= PERIOD_WINDOW_DAYS
    ) {
      const r = await emitMakeEvent({
        userId,
        eventType: "period_reminder",
        data: {
          nextExpectedStart: insights.nextExpectedStart,
          daysUntilExpected: insights.daysUntilExpected,
          lastPeriodStart: insights.lastStart,
          avgCycleLength: insights.avgCycleLength,
        },
      });
      if (r.skipped) bump("period_reminder", "skipped");
      else if (r.ok) bump("period_reminder", "sent");
      else bump("period_reminder", "failed");
    }

    // Missed tracking
    if (prefs.missed_log_reminders) {
      const delayed =
        insights.delayedDays != null && insights.delayedDays >= MISSED_DELAY_DAYS;
      const staleNoLog =
        insights.lastStart == null ||
        (() => {
          if (!insights.lastStart) return true;
          const last = new Date(insights.lastStart + "T00:00:00");
          const age =
            (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
          return age >= MISSED_NO_LOG_DAYS;
        })();

      if (delayed || staleNoLog) {
        const r = await emitMakeEvent({
          userId,
          eventType: "missed_tracking_reminder",
          data: {
            lastPeriodStart: insights.lastStart,
            delayedDays: insights.delayedDays,
            nextExpectedStart: insights.nextExpectedStart,
            reason: delayed ? "delayed_period" : "no_recent_log",
          },
        });
        if (r.skipped) bump("missed_tracking_reminder", "skipped");
        else if (r.ok) bump("missed_tracking_reminder", "sent");
        else bump("missed_tracking_reminder", "failed");
      }
    }

    // Weekly education (Mon UTC)
    if (prefs.education_tips && isEducationDay) {
      const r = await emitMakeEvent({
        userId,
        eventType: "weekly_education",
        data: {
          tipKey: "general_cycle_care",
          message:
            "Gentle reminder from Promi: logging period start dates helps your screening stay useful. This is education, not a diagnosis.",
        },
        dedupeHours: 6 * 24, // ~weekly
      });
      if (r.skipped) bump("weekly_education", "skipped");
      else if (r.ok) bump("weekly_education", "sent");
      else bump("weekly_education", "failed");
    }
  }

  return summary;
}
