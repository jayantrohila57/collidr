import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { OrgSettingsStats } from "@/domain/settings/components/org-settings-stats";
import { getServerSession } from "@/lib/server-auth";
import OrganizationSettingsGate from "./organization-settings-gate";

export const metadata: Metadata = {
  title: "Organization settings",
  description: "Manage organization profile, members, and invitations.",
};

export default async function OrganizationSettingsPage() {
  const session = await getServerSession();

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
