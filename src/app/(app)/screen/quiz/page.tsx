import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { ScreeningQuiz } from "@/components/screening/ScreeningQuiz";
import { createClient } from "@/lib/supabase/server";

function ageYearsFromDob(dob: string | null | undefined): number | undefined {
  if (!dob) return undefined;
  const birth = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age > 0 ? age : undefined;
}

export default async function ScreenQuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("height_cm, weight_kg, bmi, date_of_birth")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <header className="space-y-3 border-b border-border pb-5">
        <Link
          href="/screen"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Screening
        </Link>
        <div className="space-y-1.5">
          <p className="section-label text-primary">Quiz</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Answer honestly
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Large Yes/No per item. Age at first period helps interpret cycles.
            You can go back before submit.
          </p>
        </div>
      </header>

      <DisclaimerBanner compact />

      <ScreeningQuiz
        heightCm={profile?.height_cm}
        weightKg={profile?.weight_kg}
        bmi={profile?.bmi}
        ageYears={ageYearsFromDob(profile?.date_of_birth)}
      />
    </>
  );
}