import type { Metadata } from "next";
import DashboardSection from "@/components/section-dashboard";
import { ActivitySummaryStats } from "@/domain/audit/components/activity-summary-stats";
import AuditLogs from "@/domain/audit/components/audit-logs";
import { TimelinePageClient } from "@/domain/timeline/components/timeline-page-client";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";
import { guardAuthenticatedPage, guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Activity",
  description: "Your recent activity across organizations.",
};

/** User-level activity (#299): your own events; org activity is /[org]/activity. */
export default async function ActivityPage() {
  if (!isActionsAuditEnabledOnServer()) {
    await guardPageAction("audit.timeline.view.org");
    return (
      <DashboardSection
        title="Activity"
        description="Audit log of changes across your projects."
        back={false}
        stats={<ActivitySummaryStats />}
      >
        <AuditLogs />
      </DashboardSection>
    );
  }

  await guardAuthenticatedPage();
  return (
    <DashboardSection
      title="Activity"
      description="Everything you did, across all your organizations."
      back={false}
    >
      <TimelinePageClient scope="self" />
    </DashboardSection>
  );
}
