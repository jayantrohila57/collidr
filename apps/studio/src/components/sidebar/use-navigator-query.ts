"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { trpc } from "@/utils/trpc";

/**
 * The shared sidebar read, scoped to the URL org inside /[org]/… and to the
 * last active org on pre-org pages (#313, #314). The org slug is part of the
 * query key, so a cached read for another org is never shown.
 */
export function useNavigatorQuery() {
  const orgSlug = useCurrentOrgSlug();
  const queryEnabled = useOrgQueryEnabled();
  return useQuery({
    ...trpc.sidebar.navigator.queryOptions(orgSlug ? { orgSlug } : {}),
    enabled: queryEnabled,
    staleTime: 30_000,
  });
}
