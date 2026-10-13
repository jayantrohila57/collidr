"use client";

import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/components/patterns/settings-layout";
import { RoleBadge } from "@/components/patterns/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Can } from "@/domain/permissions/components/can";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationSectionPage } from "./organization-section-page";

const DEFAULT_ROLES = ["owner", "admin", "member"] as const;

export function OrganizationRolesPage({ slug }: { slug: string }) {
  const { organization, status } = useOrganizationBySlug(slug);

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Roles & access"
      description="Organization roles and permission policies."
    >
      <Can action="organization.settings.view">
        {status === "loading" || !organization ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : (
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
                    : role === "admin"
                      ? "Manage members, invites, and settings."
                      : "Access organization resources."
                }
              >
                <RoleBadge role={role} />
              </SettingsRow>
            ))}
          </SettingsPanel>
        )}
      </Can>
    </OrganizationSectionPage>
  );
}
