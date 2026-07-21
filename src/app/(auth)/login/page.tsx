import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/login?error=Email+and+password+required");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Login failed")}`);
  }

  // Dashboard-created users may lack app rows — seed minimal profile.
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!existing) {
    const meta = data.user.user_metadata ?? {};
    const fullName =
      (typeof meta.full_name === "string" && meta.full_name.trim()) ||
      email.split("@")[0] ||
      "User";
    // ponytail: stub DOB for manual Auth users; replace via profile edit
    const dateOfBirth =
      (typeof meta.date_of_birth === "string" && meta.date_of_birth) ||
      "2005-01-01";

    const { error: profileError } = await admin.from("profiles").upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      date_of_birth: dateOfBirth,
      sex: "female",
    });
    if (profileError) {
      redirect(`/login?error=${encodeURIComponent(profileError.message)}`);
    }
    await admin.from("notification_preferences").upsert({
      user_id: data.user.id,
    });
  }

  const { data: consent } = await admin
    .from("consents")
    .select("id")
    .eq("user_id", data.user.id)
    .limit(1)
    .maybeSingle();

  if (!consent) redirect("/consent");

  const { data: profile } = await admin
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", data.user.id)
    .maybeSingle();

  redirect(profile?.onboarding_complete ? "/home" : "/onboarding");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 py-6">
      <div className="space-y-1 text-center">
        <div className="mb-3 flex justify-center">
          <ThemeToggle className="text-foreground hover:bg-primary/10" />
        </div>
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Promise
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      </div>

      <Card className="rounded-3xl border-border/80 shadow-md shadow-primary/5">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>
        <form action={login}>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="min-h-12 rounded-xl text-base"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="min-h-12 rounded-xl text-base"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="min-h-12 w-full rounded-xl">
            Log in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Register
            </Link>
          </p>
        </CardFooter>
        </form>
      </Card>

      <div className="flex flex-col items-center gap-2">
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
