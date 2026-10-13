"use client";

import { useCallback, useEffect, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { EmptyState } from "@/components/patterns/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { appIcons } from "@/lib/icons";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationSectionPage } from "./organization-section-page";

type TeamRow = { id: string; name: string };

export function OrganizationTeamsPage({ slug }: { slug: string }) {
  const { organization, status: orgStatus } = useOrganizationBySlug(slug);
  const [teams, setTeams] = useState<TeamRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamsEnabled, setTeamsEnabled] = useState(true);

  const loadTeams = useCallback(async (organizationId: string) => {
    setLoading(true);
    try {
      const client = authClient.organization as {
        listOrganizationTeams?: (input: {
          query: { organizationId: string };
        }) => Promise<{ data?: TeamRow[] }>;
      };
      if (!client.listOrganizationTeams) {
        setTeamsEnabled(false);
        setTeams([]);
        return;
      }
      const result = await client.listOrganizationTeams({
        query: { organizationId },
      });
      setTeams(result.data ?? []);
      setTeamsEnabled(true);
    } catch {
      setTeamsEnabled(false);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!organization?.id) return;
    void loadTeams(organization.id);
  }, [organization?.id, loadTeams]);

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Teams"
      description="Group members into teams within this organization."
    >
      {orgStatus === "loading" || !organization ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : loading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : !teamsEnabled ? (
        <EmptyState
          icon={appIcons.member}
          title="Teams not enabled yet"
          description="Organization teams will appear here once the platform enables the Better Auth teams plugin for this workspace."
        />
      ) : teams && teams.length > 0 ? (
        <ul className="divide-y rounded-xl border">
          {teams.map((team) => (
            <li
              key={team.id}
              className="flex items-center gap-2 px-4 py-3 text-sm"
            >
              <AppIcon name="member" className="text-muted-foreground" />
              {team.name}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={appIcons.member}
          title="No teams yet"
          description="Create a team to organize members. Team management UI will expand in a follow-up."
        />
      )}
    </OrganizationSectionPage>
  );
}
