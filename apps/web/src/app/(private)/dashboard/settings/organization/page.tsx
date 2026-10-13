import { auth } from "@env-manager/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { OrgSettingsStats } from "@/domain/settings/components/org-settings-stats";
import OrganizationSettingsGate from "./organization-settings-gate";

export const metadata: Metadata = {
  title: "Organization settings",
  description: "Manage organization profile, members, and invitations.",
};

export default async function OrganizationSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <DashboardSection
      title="Organization"
      description="Workspace profile, members, and invitations."
      stats={<OrgSettingsStats />}
    >
      <OrganizationSettingsGate />
    </DashboardSection>
  );
}
