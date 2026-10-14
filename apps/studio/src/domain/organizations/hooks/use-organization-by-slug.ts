"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type OrgListItem,
  useActiveOrganization,
} from "@/components/org/active-organization-context";
import { authClient } from "@/lib/auth-client";
import { isBenignClientError } from "@/lib/errors/client-errors";
import { countPendingInvitations } from "@/lib/organization-invitations";

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
    initialLoadDone,
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
      const invitations = (data as { invitations?: { status?: string }[] })
        .invitations;
      const pendingInvites = Array.isArray(invitations)
        ? countPendingInvitations(invitations)
        : undefined;
      const isMember = orgs.some((o) => o.id === data.id);
      if (initialLoadDone && !isMember) {
        setOrganization(null);
        setStatus("not-found");
        return;
      }

      setOrganization({
        id: data.id,
        name: data.name,
        slug: data.slug,
        metadata: data.metadata ?? null,
        createdAt: data.createdAt,
        memberCount: Array.isArray(members) ? members.length : undefined,
        invitationCount: pendingInvites,
      });
      setStatus("success");
    } catch (err) {
      if (isBenignClientError(err)) {
        return;
      }
      setError(err instanceof Error ? err : new Error("Failed to load"));
      setStatus("error");
    }
  }, [initialLoadDone, orgs, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (status !== "success" || !organization?.id) {
      return;
    }
    const isMember = orgs.some((o) => o.id === organization.id);
    if (!isMember) {
      return;
    }
    if (organization.id !== activeOrganizationId) {
      void setActiveOrganization(organization.id);
    }
  }, [
    activeOrganizationId,
    organization?.id,
    orgs,
    setActiveOrganization,
    status,
  ]);

  return {
    organization,
    listItem,
    status,
    error,
    reload: load,
    refreshOrganizations,
  };
}
