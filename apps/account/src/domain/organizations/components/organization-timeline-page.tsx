"use client";

import type { Route } from "next";
import { EmptyState } from "@/components/patterns/empty-state";
import { appIcons } from "@/lib/icons";
import { OrganizationSectionPage } from "./organization-section-page";

export function OrganizationTimelinePage({ slug }: { slug: string }) {
  return (
    <OrganizationSectionPage
      slug={slug}
      title="Timeline"
      description="Organization-wide activity and audit events."
    >
      <EmptyState
        icon={appIcons.activity}
        title="Organization timeline"
        description="Project audit events for this workspace appear on the Activity page. A dedicated org timeline view will aggregate events here."
        actionLabel="Open Activity"
        actionHref={"/dashboard/activity" as Route}
      />
    </OrganizationSectionPage>
  );
}
