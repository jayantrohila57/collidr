import "server-only";

import { appRouter } from "@loftlancer/api/routers/index";
import type { auth } from "@loftlancer/auth";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getServerSession } from "@/lib/server-auth";
import { ServerTiming } from "@/lib/server-timing";

/** Matches @trpc/tanstack-react-query key shape for `dashboard.getOverview`. */
const dashboardOverviewQueryKey = [
  ["dashboard", "getOverview"],
  { type: "query" as const },
] as const;

export async function dehydrateDashboardOverview(
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
) {
  const queryClient = new QueryClient();

  try {
    const caller = appRouter.createCaller({ session });
    const overview = await caller.dashboard.getOverview();
    queryClient.setQueryData(dashboardOverviewQueryKey, overview);
  } catch {
    // No active org or other expected failure — client will fetch.
  }

  return dehydrate(queryClient);
}

export async function loadDashboardPage() {
  const timing = new ServerTiming("/dashboard");
  timing.logInAfter();

  const session = await timing.measure("auth", () => getServerSession());
  if (!session?.user) {
    return { session: null, dehydratedState: dehydrate(new QueryClient()) };
  }

  const dehydratedState = await timing.measure("data", () =>
    dehydrateDashboardOverview(session),
  );

  return {
    session,
    dehydratedState,
    timingHeader: timing.toHeaderValue(),
  };
}
