import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { ExportDataButton } from "@/domain/settings/components/export-data-button";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";

export const metadata: Metadata = {
  title: "Export my data",
};

export default function ExportSettingsPage() {
  if (!isActionsAuditEnabledOnServer()) {
    redirect("/dashboard/settings");
  }

  return (
    <DashboardSection
      title="Export my data"
      description="Download a JSON snapshot of profile, memberships, projects, notifications, and recent audit events."
    >
      <ExportDataButton />
    </DashboardSection>
  );
}
