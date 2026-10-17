"use client";

import { useActiveOrganization } from "@/components/org/active-organization-context";
import { useSession } from "@/domain/auth/lib/auth-actions";

/** When false, defer org-scoped tRPC queries (org switch / bootstrap). */
export function useOrgQueryEnabled() {
  const {
    isSwitching,
    enabled: orgsEnabled,
    activeOrganizationId,
  } = useActiveOrganization();
  const { data: session, isPending: sessionPending } = useSession();
  const sessionOrgId =
    (session?.session as { activeOrganizationId?: string | null } | undefined)
      ?.activeOrganizationId ?? null;

  const orgReady =
    Boolean(activeOrganizationId) || Boolean(sessionOrgId?.trim());

  return !isSwitching && !sessionPending && (!orgsEnabled || orgReady);
}
