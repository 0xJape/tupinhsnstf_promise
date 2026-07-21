import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, ChevronRight, HelpCircle, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ error?: string; saved?: string }>;
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

function numOrNull(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function boolOrNull(value: FormDataEntryValue | null) {
  const raw = String(value ?? "");
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

async function saveProfile(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) redirect("/profile?error=Name%20required");

  const stressRaw = String(formData.get("stress_level") ?? "").trim();
  const stressLevel = stressRaw ? Number(stressRaw) : null;
  if (
    stressLevel !== null &&
    (!Number.isInteger(stressLevel) || stressLevel < 1 || stressLevel > 5)
  ) {
    redirect("/profile?error=Stress%20must%20be%201%E2%80%935");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      mobile_number: String(formData.get("mobile_number") ?? "").trim() || null,
      height_cm: numOrNull(formData.get("height_cm")),
      weight_kg: numOrNull(formData.get("weight_kg")),
      waist_cm: numOrNull(formData.get("waist_cm")),
      activity_level: String(formData.get("activity_level") ?? "").trim() || null,
      exercise_frequency:
        String(formData.get("exercise_frequency") ?? "").trim() || null,
      sleep_band: String(formData.get("sleep_band") ?? "").trim() || null,
      stress_level: stressLevel,
      smoking: boolOrNull(formData.get("smoking")),
      alcohol_band: String(formData.get("alcohol_band") ?? "").trim() || null,
    })
    .eq("id", user.id);

  if (error) redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  redirect("/profile?saved=1");
}

async function logout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function ProfilePage({ searchParams }: Props) {
  const params = await searchParams;
  const error = first(params.error);
  const saved = first(params.saved);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">You</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your profile.</p>
        </header>
        <div className="surface-card flex items-center gap-3 rounded-3xl p-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
            ?
          </div>
          <div>
            <p className="font-semibold">Guest preview</p>
            <p className="text-sm text-muted-foreground">Not signed in</p>
          </div>
        </div>
        <Link
          href="/login"
          className={cn(buttonVariants(), "min-h-12 w-full rounded-xl")}
        >
          Log in
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, email, date_of_birth, mobile_number, height_cm, weight_kg, waist_cm, bmi, activity_level, exercise_frequency, sleep_band, stress_level, smoking, alcohol_band, onboarding_complete",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">You</h1>
        <p className="text-sm text-destructive">
          Profile row missing. Log out and register again, or re-login to seed it.
        </p>
        <form action={logout}>
          <Button type="submit" variant="secondary" className="min-h-11 rounded-xl">
            Log out
          </Button>
        </form>
      </div>
    );
  }

  const age = ageFromDob(profile.date_of_birth);
  const initial = (profile.full_name?.trim()?.[0] ?? "?").toUpperCase();

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">You</h1>
        <p className="text-sm text-muted-foreground">
          Your account only — changes save to your profile.
        </p>
      </header>

      <div className="surface-card flex items-center gap-3 rounded-3xl p-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{profile.full_name}</p>
          <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
          <p className="text-xs text-muted-foreground">
            Age {age}
            {profile.bmi != null ? ` · BMI ${profile.bmi}` : ""}
            {profile.onboarding_complete ? " · Setup done" : " · Setup incomplete"}
          </p>
        </div>
      </div>

      {!profile.onboarding_complete ? (
        <div className="rounded-3xl border border-primary/25 bg-primary/5 p-4">
          <p className="text-sm font-semibold">Finish guided setup</p>
          <p className="mt-1 text-sm text-muted-foreground">
            First-time questions (body, family, lifestyle) open in a step-by-step
            modal with plain-language explanations.
          </p>
          <Link
            href="/onboarding"
            className={cn(
              buttonVariants(),
              "mt-3 min-h-11 w-full rounded-xl",
            )}
          >
            Open setup guide
          </Link>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
          Profile saved.
        </p>
      ) : null}

      <Card className="rounded-3xl border-border/80 shadow-sm">
        <form action={saveProfile}>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>
              Quick edits after setup. New accounts should use the guided modal
              first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Full name" htmlFor="full_name">
              <Input
                id="full_name"
                name="full_name"
                required
                defaultValue={profile.full_name ?? ""}
                className="min-h-11 rounded-xl"
              />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                value={profile.email ?? ""}
                disabled
                className="min-h-11 rounded-xl"
              />
            </Field>
            <Field label="Date of birth" htmlFor="dob">
              <Input
                id="dob"
                value={profile.date_of_birth ?? ""}
                disabled
                className="min-h-11 rounded-xl"
              />
            </Field>
            <Field label="Mobile (SMS)" htmlFor="mobile_number">
              <Input
                id="mobile_number"
                name="mobile_number"
                type="tel"
                defaultValue={profile.mobile_number ?? ""}
                className="min-h-11 rounded-xl"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Height (cm)" htmlFor="height_cm">
                <Input
                  id="height_cm"
                  name="height_cm"
                  type="number"
                  step="0.1"
                  min="1"
                  defaultValue={profile.height_cm ?? ""}
                  className="min-h-11 rounded-xl"
                />
              </Field>
              <Field label="Weight (kg)" htmlFor="weight_kg">
                <Input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  step="0.1"
                  min="1"
                  defaultValue={profile.weight_kg ?? ""}
                  className="min-h-11 rounded-xl"
                />
              </Field>
            </div>
            <Field label="Waist (cm)" htmlFor="waist_cm">
              <Input
                id="waist_cm"
                name="waist_cm"
                type="number"
                step="0.1"
                min="1"
                defaultValue={profile.waist_cm ?? ""}
                className="min-h-11 rounded-xl"
              />
            </Field>
            <Field label="Activity level" htmlFor="activity_level">
              <select
                id="activity_level"
                name="activity_level"
                defaultValue={profile.activity_level ?? ""}
                className="min-h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Not set</option>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
              </select>
            </Field>
            <Field label="Exercise frequency" htmlFor="exercise_frequency">
              <select
                id="exercise_frequency"
                name="exercise_frequency"
                defaultValue={profile.exercise_frequency ?? ""}
                className="min-h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Not set</option>
                <option value="none">None</option>
                <option value="1-2/week">1–2 / week</option>
                <option value="3-4/week">3–4 / week</option>
                <option value="5+/week">5+ / week</option>
              </select>
            </Field>
            <Field label="Sleep" htmlFor="sleep_band">
              <select
                id="sleep_band"
                name="sleep_band"
                defaultValue={profile.sleep_band ?? ""}
                className="min-h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Not set</option>
                <option value="<6h">&lt;6 hours</option>
                <option value="6-7h">6–7 hours</option>
                <option value="7-9h">7–9 hours</option>
                <option value=">9h">&gt;9 hours</option>
              </select>
            </Field>
            <Field label="Stress (1–5)" htmlFor="stress_level">
              <Input
                id="stress_level"
                name="stress_level"
                type="number"
                min={1}
                max={5}
                defaultValue={profile.stress_level ?? ""}
                className="min-h-11 rounded-xl"
              />
            </Field>
            <Field label="Smoking" htmlFor="smoking">
              <select
                id="smoking"
                name="smoking"
                defaultValue={
                  profile.smoking === null || profile.smoking === undefined
                    ? ""
                    : profile.smoking
                      ? "true"
                      : "false"
                }
                className="min-h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Not set</option>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </Field>
            <Field label="Alcohol" htmlFor="alcohol_band">
              <select
                id="alcohol_band"
                name="alcohol_band"
                defaultValue={profile.alcohol_band ?? ""}
                className="min-h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Not set</option>
                <option value="none">None</option>
                <option value="occasional">Occasional</option>
                <option value="weekly">Weekly</option>
                <option value="frequent">Frequent</option>
              </select>
            </Field>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="min-h-12 w-full rounded-xl">
              Save profile
            </Button>
          </CardFooter>
        </form>
      </Card>

      <ul className="surface-card overflow-hidden">
        <li>
          <Link
            href="/profile/notifications"
            className="flex min-h-14 items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-accent"
          >
            <Bell className="size-5 text-primary" aria-hidden />
            <span className="flex-1">Notifications</span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </Link>
        </li>
        <li className="border-t border-border">
          <Link
            href="/help"
            className="flex min-h-14 items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-accent"
          >
            <HelpCircle className="size-5 text-primary" aria-hidden />
            <span className="flex-1">Help & disclaimers</span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </Link>
        </li>
        <li className="border-t border-border/70">
          <form action={logout}>
            <button
              type="submit"
              className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-muted/60"
            >
              <LogOut className="size-5 text-primary" aria-hidden />
              <span className="flex-1">Log out</span>
            </button>
          </form>
        </li>
      </ul>
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
