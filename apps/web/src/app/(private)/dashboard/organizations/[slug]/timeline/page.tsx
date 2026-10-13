import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { TimelinePageClient } from "@/domain/timeline/components/timeline-page-client";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";

export const metadata: Metadata = {
  title: "Organization timeline",
};

export default function OrgTimelinePage() {
  if (!isActionsAuditEnabledOnClient()) {
    redirect("/dashboard/activity");
  }

  return (
    <DashboardSection
      title="Timeline"
      description="Audit events for this organization."
    >
      <TimelinePageClient scope="org" />
    </DashboardSection>
  );
}
