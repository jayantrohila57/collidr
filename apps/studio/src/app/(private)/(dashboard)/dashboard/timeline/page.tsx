import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { TimelinePageClient } from "@/domain/timeline/components/timeline-page-client";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";

export const metadata: Metadata = {
  title: "Timeline",
  description: "Organization audit timeline.",
};

export default async function TimelinePage() {
  if (!isActionsAuditEnabledOnServer()) {
    redirect("/dashboard/activity");
  }

  return (
    <DashboardSection
      title="Timeline"
      description="Security and activity events for your organization."
    >
      <TimelinePageClient scope="org" />
    </DashboardSection>
  );
}
