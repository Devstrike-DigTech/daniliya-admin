import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import OnboardingView from "./OnboardingView";
import type { AssessmentQuestion, TutorialStep } from "./actions";

export const metadata: Metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const [lessons, questions] = await Promise.all([
    apiFetchSafe<TutorialStep[]>("/admin/onboarding/tutorial"),
    apiFetchSafe<AssessmentQuestion[]>("/admin/onboarding/assessment"),
  ]);
  return (
    <OnboardingView lessons={lessons ?? []} questions={questions ?? []} />
  );
}
