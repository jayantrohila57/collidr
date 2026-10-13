"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { OrgSettingsStats } from "@/domain/settings/components/org-settings-stats";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationSectionPage } from "./organization-section-page";
import { OrganizationSettingsForm } from "./organization-settings-form";

export function OrganizationSettingsPage({ slug }: { slug: string }) {
  const { organization, status } = useOrganizationBySlug(slug);

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Settings"
      description="Workspace profile, slug, and danger zone."
    >
      <div className="flex flex-col gap-4">
        <OrgSettingsStats />
        {status === "loading" || !organization ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <OrganizationSettingsForm
            key={organization.id}
            organizationId={organization.id}
            mode="settings-hub"
          />
        )}
      </div>
    </OrganizationSectionPage>
  );
}
