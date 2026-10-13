import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { ActivitySummaryStats } from "@/domain/audit/components/activity-summary-stats";
import AuditLogs from "@/domain/audit/components/audit-logs";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Activity",
  description: "Organization audit log and recent changes.",
};

export default async function ActivityPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/");
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
