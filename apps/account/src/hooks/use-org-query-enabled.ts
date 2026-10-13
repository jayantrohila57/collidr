"use client";

import { useActiveOrganization } from "@/components/org/active-organization-context";

/** When false, defer org-scoped tRPC queries (org switch / bootstrap). */
export function useOrgQueryEnabled() {
  const {
    isSwitching,
    enabled: orgsEnabled,
    initialLoadDone,
    activeOrganizationId,
  } = useActiveOrganization();

  return (
    !isSwitching &&
    (!orgsEnabled || (initialLoadDone && Boolean(activeOrganizationId)))
  );
}
