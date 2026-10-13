/** When the client picks a default org but the session has none, call setActive once. */
export function shouldBootstrapSessionActiveOrganization(
  sessionActiveOrganizationId: string | null | undefined,
  resolvedActiveOrganizationId: string | null,
  explicitOverride: string | null | undefined,
): boolean {
  if (explicitOverride != null) return false;
  if (!resolvedActiveOrganizationId) return false;
  if (sessionActiveOrganizationId) return false;
  return true;
}
