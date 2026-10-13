import { isOrganizationsEnabled } from "@collidr/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationSectionPage } from "@/domain/organizations/components/organization-section-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { TimelinePageClient } from "@/domain/timeline/components/timeline-page-client";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";
import { guardOrganizationSlugPage } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Timeline",
  description: "Organization activity timeline.",
};

export default async function OrganizationTimelineRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect("/dashboard");
  if (!isActionsAuditEnabledOnServer()) {
    redirect("/dashboard/activity");
  }

  const { slug } = await params;
  await guardOrganizationSlugPage(slug, "timeline");

  return (
    <OrganizationsFeatureGate>
      <OrganizationSectionPage
        slug={slug}
        title="Timeline"
        description="Audit events for this organization."
      >
        <TimelinePageClient scope="org" />
      </OrganizationSectionPage>
    </OrganizationsFeatureGate>
  );
}
