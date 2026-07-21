import { redirect } from "next/navigation";

/** Old /onboarding/[step] URLs → single modal wizard. */
export default async function OnboardingStepRedirect() {
  redirect("/onboarding");
}
