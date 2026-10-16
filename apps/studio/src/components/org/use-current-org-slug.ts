"use client";

import { useActiveOrganization } from "@/components/org/active-organization-context";
import { useRouteScope } from "@/utils/use-route-scope";

/**
 * Org slug for links: the URL org inside /[org]/…, otherwise the session's
 * active org (sidebar and user-level pages). Null when there is none.
 */
export function useCurrentOrgSlug(): string | null {
  const { org } = useRouteScope();
  const { orgs, activeOrganizationId } = useActiveOrganization();
  if (org) return org;
  return orgs.find((o) => o.id === activeOrganizationId)?.slug ?? null;
}
