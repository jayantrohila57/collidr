import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { OrganizationsPageClient } from "@/domain/organizations/components/organizations-page-client";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

export const metadata: Metadata = {
  title: "Organizations",
  description: "Manage your organizations.",
};

export default function OrganizationsPage() {
  if (!isOrganizationsEnabledOnClient()) {
    redirect("/dashboard");
  }
  if (!isActionsAuditEnabledOnClient()) {
    redirect("/dashboard/settings/organization");
  }

  return (
    <DashboardSection
      title="Organizations"
      description="Workspaces you belong to."
    >
      <OrganizationsPageClient />
    </DashboardSection>
  );
}
