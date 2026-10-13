"use client";

import { useActiveOrganization } from "@/components/org/active-organization-context";
import { EmptyState } from "@/components/patterns/empty-state";
import { appIcons } from "@/lib/icons";
import { OrganizationsListContent } from "./organizations-list-content";
import { OrganizationsListSkeleton } from "./skeletons";

type OrganizationsListProps = {
  onCreateOrganization?: () => void;
};

export function OrganizationsList({
  onCreateOrganization,
}: OrganizationsListProps) {
  const { orgs, loading, initialLoadDone } = useActiveOrganization();

  if (!initialLoadDone || loading) {
    return <OrganizationsListSkeleton />;
  }

  if (orgs.length === 0) {
    return (
      <EmptyState
        icon={appIcons.organization}
        title="No organizations yet"
        description="Create a workspace to collaborate with your team."
        actionLabel="New organization"
        onAction={onCreateOrganization}
      />
    );
  }

  return (
    <OrganizationsListContent onCreateOrganization={onCreateOrganization} />
  );
}
