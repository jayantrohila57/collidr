"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type OrgListItem,
  useActiveOrganization,
} from "@/components/org/active-organization-context";
import { authClient } from "@/lib/auth-client";

export type OrganizationDetail = {
  id: string;
  name: string;
  slug: string;
  metadata?: string | Record<string, unknown> | null;
  createdAt?: Date | string;
  memberCount?: number;
  invitationCount?: number;
};

type LoadStatus = "loading" | "success" | "error" | "not-found";

export function useOrganizationBySlug(slug: string) {
  const {
    orgs,
    refreshOrganizations,
    setActiveOrganization,
    activeOrganizationId,
  } = useActiveOrganization();
  const [organization, setOrganization] = useState<OrganizationDetail | null>(
    null,
  );
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<Error | null>(null);

  const listItem = orgs.find((o) => o.slug === slug) as OrgListItem | undefined;

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const result = await authClient.organization.getFullOrganization({
        query: { organizationSlug: slug },
      });
      if (!result.data) {
        setOrganization(null);
        setStatus("not-found");
        return;
      }
      const data = result.data;
      const members = (data as { members?: unknown[] }).members;
      const invitations = (data as { invitations?: unknown[] }).invitations;
      setOrganization({
        id: data.id,
        name: data.name,
        slug: data.slug,
        metadata: data.metadata ?? null,
        createdAt: data.createdAt,
        memberCount: Array.isArray(members) ? members.length : undefined,
        invitationCount: Array.isArray(invitations)
          ? invitations.length
          : undefined,
      });
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load"));
      setStatus("error");
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (
      status === "success" &&
      organization?.id &&
      organization.id !== activeOrganizationId
    ) {
      void setActiveOrganization(organization.id);
    }
  }, [activeOrganizationId, organization?.id, setActiveOrganization, status]);

  return {
    organization,
    listItem,
    status,
    error,
    reload: load,
    refreshOrganizations,
  };
}
