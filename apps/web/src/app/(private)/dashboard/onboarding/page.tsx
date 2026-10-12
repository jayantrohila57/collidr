import { auth } from "@env-manager/auth";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  if (!isOrganizationsEnabled()) {
    redirect("/dashboard");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return <OnboardingClient />;
}
