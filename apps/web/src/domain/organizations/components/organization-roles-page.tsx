"use client";

import type { ReactNode } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { ErrorState } from "@/components/patterns/error-state";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/components/patterns/settings-layout";
import { SettingsPanelSkeleton } from "@/components/patterns/settings-panel-skeleton";
import { RoleBadge } from "@/components/patterns/status-badge";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { orgSectionAction } from "@/domain/permissions/org-section-actions";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationSectionPage } from "./organization-section-page";

const DEFAULT_ROLES = ["owner", "manager", "member"] as const;

export function OrganizationRolesPage({ slug }: { slug: string }) {
  const { organization, status, error } = useOrganizationBySlug(slug);
  const { activeOrganizationId, isSwitching } = useActiveOrganization();
  const rolesAction = orgSectionAction("roles");
  const { allowed, isLoading: permissionsLoading } = useCan(rolesAction);

  const sessionMatchesOrg =
    Boolean(organization?.id) && activeOrganizationId === organization?.id;
  const permissionsReady = sessionMatchesOrg && !isSwitching;

  let body: ReactNode;
  if (status === "loading" || !organization) {
    body = <SettingsPanelSkeleton rows={3} />;
  } else if (status === "error") {
    body = (
      <ErrorState
        title="Could not load workspace"
        description={error?.message ?? "Try refreshing the page."}
      />
    );
  } else if (!permissionsReady || permissionsLoading) {
    body = <SettingsPanelSkeleton rows={3} />;
  } else if (!allowed) {
    body = (
      <ErrorState
        title="Not allowed"
        description="You do not have permission to view roles and access for this workspace."
      />
    );
  } else {
    body = (
      <SettingsPanel>
        <SettingsSectionHeader
          title="Built-in roles"
          description="Default Better Auth organization roles. Custom roles and fine-grained permissions are wired by the permissions module."
          icon="lock"
        />
        {DEFAULT_ROLES.map((role) => (
          <SettingsRow
            key={role}
            label={role}
            description={
              role === "owner"
                ? "Full control including deletion."
                : role === "manager"
                  ? "Manage members, invites, and settings."
                  : "Access organization resources."
            }
          >
            <RoleBadge role={role} />
          </SettingsRow>
        ))}
      </SettingsPanel>
    );
  }

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Roles & access"
      description="Organization roles and permission policies."
    >
      {body}
    </OrganizationSectionPage>
  );
}
