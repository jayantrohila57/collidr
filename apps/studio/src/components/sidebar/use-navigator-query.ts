"use client";

import { useQuery } from "@tanstack/react-query";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import { trpc } from "@/utils/trpc";
import { useRouteScope } from "@/utils/use-route-scope";

/**
 * The shared sidebar read, scoped to the URL org inside /[org]/… and to the
 * last active org on pre-org pages (#313, #314). The org slug is part of the
 * query key, so a cached read for another org is never shown.
 */
export function useNavigatorQuery() {
  const { org } = useRouteScope();
  const { enabled, initialLoadDone } = useActiveOrganization();
  const orgSlug = useCurrentOrgSlug();
  return useQuery({
    ...trpc.sidebar.navigator.queryOptions(orgSlug ? { orgSlug } : {}),
    // Pre-org pages wait for the org list so the key is stable.
    enabled: Boolean(org) || !enabled || initialLoadDone,
    staleTime: 30_000,
  });
}
