/** Show loading UI only when org-gated query has no hydrated/cached data yet. */
export function useOrgScopedQueryPlaceholder(
  queryEnabled: boolean,
  data: unknown,
  isPending: boolean,
) {
  return (
    (isPending && data === undefined) || (!queryEnabled && data === undefined)
  );
}
