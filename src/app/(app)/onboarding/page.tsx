import { redirect } from "next/navigation";
import { SetupWizard } from "@/components/onboarding/SetupWizard";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: consent } = await supabase
    .from("consents")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!consent) redirect("/consent");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login?error=Profile%20missing");
  if (profile.onboarding_complete) redirect("/home");

  const firstName = profile.full_name.trim().split(/\s+/)[0] ?? "";

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Setup guide</h1>
        <p className="text-sm text-muted-foreground">
          Welcome, {firstName}. Finish this short tour so home and screening fit
          you.
        </p>
      </header>
      <SetupWizard firstName={firstName} openByDefault />
    </div>
  );
}
