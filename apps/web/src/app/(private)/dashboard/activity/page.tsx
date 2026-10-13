import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { ActivitySummaryStats } from "@/domain/audit/components/activity-summary-stats";
import AuditLogs from "@/domain/audit/components/audit-logs";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Activity",
  description: "Organization audit log and recent changes.",
};

export default async function ActivityPage() {
  await guardPageAction("audit.timeline.view.org");
  if (isActionsAuditEnabledOnServer()) {
    redirect("/dashboard/timeline");
  }

  return (
    <DashboardSection
      title="Activity"
      description="Audit log of changes across your projects."
      stats={<ActivitySummaryStats />}
    >
      <AuditLogs />
    </DashboardSection>
  );
}
