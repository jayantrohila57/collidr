import type { QueryClient } from "@tanstack/react-query";

function isOrgScopedQuery(queryKey: unknown): boolean {
  const serialized = JSON.stringify(queryKey);
  return (
    serialized.includes("dashboard") ||
    serialized.includes("projects") ||
    serialized.includes("environments") ||
    serialized.includes("audit")
  );
}

/** Drop org-scoped API cache after the active organization changes (session cookie updated). */
export function invalidateAfterOrganizationChange(queryClient: QueryClient) {
  return queryClient.removeQueries({
    predicate: (query) => isOrgScopedQuery(query.queryKey),
  });
}
