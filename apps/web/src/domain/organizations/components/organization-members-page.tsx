"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationSectionPage } from "./organization-section-page";
import { OrganizationSettingsForm } from "./organization-settings-form";

export function OrganizationMembersPage({ slug }: { slug: string }) {
  const { organization, status } = useOrganizationBySlug(slug);

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Members"
      description="Invite teammates and manage organization roles."
    >
      {status === "loading" || !organization ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <OrganizationSettingsForm
          key={organization.id}
          organizationId={organization.id}
          mode="members"
        />
      )}
    </OrganizationSectionPage>
  );
}
