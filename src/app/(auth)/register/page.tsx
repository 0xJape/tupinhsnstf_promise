import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
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
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

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

async function register(formData: FormData) {
  "use server";

  const fullName = String(formData.get("fullName") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !dateOfBirth || !email || password.length < 8) {
    redirect("/register?error=Fill%20all%20fields%20and%20use%208%2B%20password%20characters");
  }

  const age = ageFromDob(dateOfBirth);
  if (age < 12 || age > 24) {
    redirect("/register?error=P.R.O.M.I.S.E.%20is%20for%20ages%2012%E2%80%9324");
  }

  // Admin createUser skips confirmation email (free-tier rate limit).
  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, date_of_birth: dateOfBirth },
  });
  if (createError || !created.user) {
    redirect(
      `/register?error=${encodeURIComponent(createError?.message ?? "Registration failed")}`,
    );
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    email,
    full_name: fullName,
    date_of_birth: dateOfBirth,
    sex: "female",
  });
  if (profileError) {
    redirect(`/register?error=${encodeURIComponent(profileError.message)}`);
  }

  await admin.from("notification_preferences").upsert({ user_id: created.user.id });

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    redirect(`/login?error=${encodeURIComponent(signInError.message)}`);
  }

  redirect("/consent");
}

export default async function RegisterPage({ searchParams }: Props) {
  const error = first((await searchParams).error);

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 py-6">
      <div className="space-y-1 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Promise
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      </div>

      <DisclaimerBanner compact />

      <Card className="rounded-3xl border-border/80 shadow-md shadow-primary/5">
        <form action={register}>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Ages 12–24 (female). Guardian consent for 12–17 comes next.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                autoComplete="name"
                required
                className="min-h-12 rounded-xl text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                className="min-h-12 rounded-xl text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="min-h-12 rounded-xl text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="min-h-12 rounded-xl text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <SubmitButton pendingLabel="Creating account…" className="min-h-12 w-full rounded-xl">
              Register
            </SubmitButton>
            <p className="text-center text-sm text-muted-foreground">
              Have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      <div className="flex flex-col items-center gap-2">
        <Link
          href="/home"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "min-h-11 w-full max-w-sm rounded-xl",
          )}
        >
          Browse app without login
        </Link>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost" }), "text-muted-foreground")}
        >
          Back to landing
        </Link>
      </div>
    </div>
  );
}
