import type { QueryClient } from "@tanstack/react-query";

/** Drop cached API data after the active organization changes (session cookie updated). */
export async function invalidateAfterOrganizationChange(
  queryClient: QueryClient,
) {
  await queryClient.resetQueries();
}
