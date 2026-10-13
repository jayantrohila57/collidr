import { buildFeatureFlagSnapshot } from "@env-manager/env/feature-flags";
import { env } from "@env-manager/env/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { ProductionDeployRunbook } from "@/domain/settings/components/production-deploy-runbook";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Deploy runbook",
  description:
    "Production deploy checklist, Vercel rate-limit mitigations, and feature-flag status.",
};

export default async function DeployRunbookPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/");
  }

  const serverFlags = buildFeatureFlagSnapshot(
    env as Record<string, string | undefined>,
  );

  return (
    <DashboardSection
      title="Deploy runbook"
      description="Production reliability: feature flags, redeploy rules, and Vercel deploy limits."
      back="auto"
    >
      <ProductionDeployRunbook serverFlags={serverFlags} />
    </DashboardSection>
  );
}
