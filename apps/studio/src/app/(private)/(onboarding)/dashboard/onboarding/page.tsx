import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { guardPageAction } from "@/lib/page-guards";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  if (!isOrganizationsEnabled()) {
    redirect("/dashboard" as Route);
  }

  await guardPageAction("organization.create");

  return <OnboardingClient />;
}
