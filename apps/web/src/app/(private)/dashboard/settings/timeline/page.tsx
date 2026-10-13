import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { TimelinePageClient } from "@/domain/timeline/components/timeline-page-client";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";

export const metadata: Metadata = {
  title: "Account timeline",
  description: "Your personal audit timeline.",
};

export default function SettingsTimelinePage() {
  if (!isActionsAuditEnabledOnClient()) {
    redirect("/dashboard/settings");
  }

  return (
    <DashboardSection
      title="Timeline"
      description="Audit events for actions taken on your account."
    >
      <TimelinePageClient scope="self" />
    </DashboardSection>
  );
}
