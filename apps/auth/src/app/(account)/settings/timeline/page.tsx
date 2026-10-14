import type { Metadata } from "next";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(account)/settings/_components/settings-section-shell";
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
    redirect("/settings/profile" as Route);
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
