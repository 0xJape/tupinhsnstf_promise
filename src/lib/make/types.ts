export const MAKE_EVENT_TYPES = [
  "period_reminder",
  "missed_tracking_reminder",
  "elevated_risk_followup",
  "weekly_education",
  /** User opted in: send patient summary to care desk (not to user). */
  "care_referral",
] as const;

export type MakeEventType = (typeof MAKE_EVENT_TYPES)[number];

export type MakeChannel = "email" | "sms" | "both";

export type MakePayload = {
  eventType: MakeEventType;
  userId: string;
  /** Delivery target: user contact OR care desk for care_referral */
  email: string | null;
  mobile: string | null;
  channels: ("email" | "sms")[];
  templateKey: string;
  data: Record<string, unknown>;
  timestamp: string;
  eventId: string;
};

export const TEMPLATE_KEYS: Record<MakeEventType, string> = {
  period_reminder: "period_reminder_v1",
  missed_tracking_reminder: "missed_log_v1",
  elevated_risk_followup: "elevated_risk_v1",
  weekly_education: "weekly_education_v1",
  care_referral: "care_referral_v1",
};
