import { guardPageAction } from "@/lib/page-guards";
import { redirectToStudio } from "@/lib/studio-redirect";

export default async function OnboardingRedirectPage() {
  await guardPageAction("organization.create");
  redirectToStudio("/dashboard/onboarding");
}
