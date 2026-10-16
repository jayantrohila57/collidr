import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import { redirect } from "next/navigation";
import { guardPageAction } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  if (!isOrganizationsEnabled()) {
    redirect(routes.home());
  }

  await guardPageAction("organization.create");

  return <OnboardingClient />;
}
