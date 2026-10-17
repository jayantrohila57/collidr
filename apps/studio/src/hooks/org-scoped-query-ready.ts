/** Pure gate for org-scoped client queries (sidebar, projects list, stats). */
export function isOrgScopedQueryReady(input: {
  orgsEnabled: boolean;
  isSwitching: boolean;
  sessionPending: boolean;
  activeOrganizationId: string | null;
  sessionOrganizationId: string | null | undefined;
  urlOrgSlug?: string | null;
}): boolean {
  if (input.isSwitching || input.sessionPending) {
    return false;
  }
  if (!input.orgsEnabled) {
    return true;
  }
  return (
    Boolean(input.activeOrganizationId) ||
    Boolean(input.sessionOrganizationId?.trim()) ||
    Boolean(input.urlOrgSlug?.trim())
  );
}
