import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(private)/settings/_components/settings-section-shell";
import { TimelinePageClient } from "@/domain/timeline/components/timeline-page-client";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Timeline",
  description: "Your personal audit history.",
};

export default async function SettingsTimelinePage() {
  await guardPageAction("audit.timeline.view.self");

  if (!isActionsAuditEnabledOnServer()) {
    redirect("/settings/profile");
  }

  return (
    <SettingsSectionShell
      title="Timeline"
      description="Security and activity events for your account."
    >
      <Suspense fallback={null}>
        <TimelinePageClient scope="self" />
      </Suspense>
    </SettingsSectionShell>
  );
}
