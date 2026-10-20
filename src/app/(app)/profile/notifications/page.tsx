import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ error?: string; saved?: string }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function on(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

async function savePrefs(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const emailEnabled = on(formData, "email_enabled");
  const smsEnabled = on(formData, "sms_enabled");

  if (smsEnabled) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("mobile_number")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.mobile_number) {
      redirect(
        "/profile/notifications?error=Add%20a%20mobile%20number%20on%20Profile%20before%20enabling%20SMS",
      );
    }
  }

  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: user.id,
    email_enabled: emailEnabled,
    sms_enabled: smsEnabled,
    period_reminders: on(formData, "period_reminders"),
    missed_log_reminders: on(formData, "missed_log_reminders"),
    risk_followups: on(formData, "risk_followups"),
    education_tips: on(formData, "education_tips"),
  });

  if (error) {
    redirect(`/profile/notifications?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/profile/notifications?saved=1");
}

export default async function NotificationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = first(params.error);
  const saved = first(params.saved);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select(
      "email_enabled, sms_enabled, period_reminders, missed_log_reminders, risk_followups, education_tips",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const p = prefs ?? {
    email_enabled: true,
    sms_enabled: false,
    period_reminders: true,
    missed_log_reminders: true,
    risk_followups: true,
    education_tips: false,
  };

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Preferences for your account only.
        </p>
      </header>

      {error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
          Preferences saved.
        </p>
      ) : null}

      <Card className="rounded-3xl border-border/80 shadow-sm">
        <form action={savePrefs}>
          <CardHeader>
            <CardTitle>Channels & reminders</CardTitle>
            <CardDescription>
              SMS needs a mobile number on your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Toggle
              id="email_enabled"
              name="email_enabled"
              label="Email"
              defaultChecked={!!p.email_enabled}
            />
            <Toggle
              id="sms_enabled"
              name="sms_enabled"
              label="SMS"
              defaultChecked={!!p.sms_enabled}
            />
            <Toggle
              id="period_reminders"
              name="period_reminders"
              label="Period reminders"
              defaultChecked={!!p.period_reminders}
            />
            <Toggle
              id="missed_log_reminders"
              name="missed_log_reminders"
              label="Missed log reminders"
              defaultChecked={!!p.missed_log_reminders}
            />
            <Toggle
              id="risk_followups"
              name="risk_followups"
              label="Risk follow-ups"
              defaultChecked={!!p.risk_followups}
            />
            <Toggle
              id="education_tips"
              name="education_tips"
              label="Education tips"
              defaultChecked={!!p.education_tips}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <SubmitButton pendingLabel="Saving…" className="min-h-12 w-full rounded-xl">
              Save preferences
            </SubmitButton>
            <Link
              href="/profile"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-muted-foreground",
              )}
            >
              Back to profile
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function Toggle({
  id,
  name,
  label,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/80 px-3 py-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-5 accent-primary"
      />
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
    </div>
  );
}
