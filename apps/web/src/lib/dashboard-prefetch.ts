import "server-only";

import { appRouter } from "@env-manager/api/routers/index";
import { auth } from "@env-manager/auth";
import { dehydrate, QueryClient } from "@tanstack/react-query";

/** Matches @trpc/tanstack-react-query key shape for `dashboard.getOverview`. */
const dashboardOverviewQueryKey = [
  ["dashboard", "getOverview"],
  { type: "query" as const },
] as const;

export async function dehydrateDashboardOverview(
  headers: Awaited<ReturnType<typeof import("next/headers").headers>>,
) {
  const queryClient = new QueryClient();
  const session = await auth.api.getSession({ headers });
  if (!session) {
    return dehydrate(queryClient);
  }

  try {
    const caller = appRouter.createCaller({ session });
    const overview = await caller.dashboard.getOverview();
    queryClient.setQueryData(dashboardOverviewQueryKey, overview);
  } catch {
    // No active org or other expected failure — client will fetch.
  }

  return dehydrate(queryClient);
}
