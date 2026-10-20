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
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const POLICY_VERSION =
  process.env.CONSENT_POLICY_VERSION?.trim() || "consent-v1";

type Props = {
  searchParams: Promise<{ error?: string | string[] }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function ageFromDob(dob: string) {
  const birth = new Date(`${dob}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function checked(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

async function acceptConsent(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=Please%20log%20in%20first");

  const { data: profile } = await supabase
    .from("profiles")
    .select("date_of_birth")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.date_of_birth) {
    redirect("/consent?error=Profile%20missing%20—%20log%20in%20again");
  }

  const age = ageFromDob(profile.date_of_birth);
  const isMinor = age >= 12 && age <= 17;

  const nonDiagnosis = checked(formData, "non_diagnosis");
  const healthData = checked(formData, "health_data");
  const aiThirdParty = checked(formData, "ai_third_party");
  const notifications = checked(formData, "notifications");
  const researchFraming = checked(formData, "research_framing");
  const guardianConsent = checked(formData, "guardian_consent");
  const participantAssent = checked(formData, "participant_assent");

  if (
    !nonDiagnosis ||
    !healthData ||
    !aiThirdParty ||
    !notifications ||
    !researchFraming
  ) {
    redirect("/consent?error=Accept%20all%20required%20items%20to%20continue");
  }

  if (isMinor && (!guardianConsent || !participantAssent)) {
    redirect(
      "/consent?error=Guardian%20consent%20and%20your%20assent%20are%20required%20for%20ages%2012%E2%80%9317",
    );
  }

  const { error } = await supabase.from("consents").insert({
    user_id: user.id,
    policy_version: POLICY_VERSION,
    non_diagnosis: true,
    health_data: true,
    ai_third_party: true,
    notifications: true,
    research_framing: true,
    guardian_consent: isMinor ? true : null,
    participant_assent: isMinor ? true : null,
  });

  if (error) {
    redirect(`/consent?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/onboarding");
}

export default async function ConsentPage({ searchParams }: Props) {
  const error = first((await searchParams).error);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("consents")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .maybeSingle();
    redirect(profile?.onboarding_complete ? "/home" : "/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, date_of_birth")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.date_of_birth) {
    redirect("/login?error=Complete%20registration%20or%20log%20in%20again");
  }

  const age = ageFromDob(profile.date_of_birth);
  const isMinor = age >= 12 && age <= 17;

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 py-6">
      <div className="space-y-1 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Promise
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Before you continue</h1>
        <p className="text-sm text-muted-foreground">
          {profile.full_name ? `Hi ${profile.full_name}. ` : null}
          Please review and accept these items ({POLICY_VERSION}).
        </p>
      </div>

      <DisclaimerBanner compact />

      <Card className="rounded-3xl border-border/80 shadow-md shadow-primary/5">
        <form action={acceptConsent}>
          <CardHeader>
            <CardTitle>Required consents</CardTitle>
            <CardDescription>
              Educational screening only. Not a diagnosis or emergency service.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <ConsentCheck
              id="non_diagnosis"
              name="non_diagnosis"
              label="Non-diagnosis"
              text="I understand P.R.O.M.I.S.E. does not diagnose PCOS and does not replace professional medical care."
            />
            <ConsentCheck
              id="health_data"
              name="health_data"
              label="Health data"
              text="I agree that my profile, menstrual logs, and screening answers will be stored in my account to provide app features for this capstone research system."
            />
            <ConsentCheck
              id="ai_third_party"
              name="ai_third_party"
              label="AI assistance"
              text="I consent to AI-assisted explanations from Promi (the in-app education guide), which may process my questions and limited health context through secure third-party processing."
            />
            <ConsentCheck
              id="notifications"
              name="notifications"
              label="Notifications"
              text="I agree to receive email and/or SMS reminders related to tracking and follow-up via automated workflows."
            />
            <ConsentCheck
              id="research_framing"
              name="research_framing"
              label="Research framing"
              text="I understand this system is developed as an academic capstone project in the Philippines."
            />

            {isMinor ? (
              <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm font-medium">Ages 12–17</p>
                <ConsentCheck
                  id="guardian_consent"
                  name="guardian_consent"
                  label="Guardian consent"
                  text="A parent/guardian has been informed and consents to my participation."
                />
                <ConsentCheck
                  id="participant_assent"
                  name="participant_assent"
                  label="My assent"
                  text="I assent to using the app and sharing the information described above."
                />
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <SubmitButton pendingLabel="Saving consent…" className="min-h-12 w-full rounded-xl">
              I agree — continue
            </SubmitButton>
            <p className="text-center text-xs text-muted-foreground">
              Declining required items means you cannot use the full app.
            </p>
          </CardFooter>
        </form>
      </Card>

      <div className="flex flex-col items-center gap-2">
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "ghost" }), "text-muted-foreground")}
        >
          Use a different account
        </Link>
      </div>
    </div>
  );
}

function ConsentCheck({
  id,
  name,
  label,
  text,
}: {
  id: string;
  name: string;
  label: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border/80 bg-background/60 p-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        required
        className="mt-1 size-5 shrink-0 rounded border-border accent-primary"
      />
      <Label htmlFor={id} className="items-start gap-1 font-normal">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-sm leading-snug text-muted-foreground">
          {text}
        </span>
      </Label>
    </div>
  );
}
