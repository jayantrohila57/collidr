import "server-only";

import { prefetchWithCaller } from "@collidr/api/prefetch-with-caller";
import { studioRouter } from "@collidr/api/routers/studio";
import type { auth } from "@collidr/auth";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getServerSession } from "@/lib/server-auth";
import { ServerTiming } from "@/lib/server-timing";
import { trpcQueryOptions } from "@/utils/trpc-query-options";

export async function dehydrateDashboardOverview(
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
) {
  const queryClient = new QueryClient();
  const caller = studioRouter.createCaller({ session });

  try {
    await prefetchWithCaller(
      queryClient,
      trpcQueryOptions.dashboard.getOverview.queryOptions(),
      () => caller.dashboard.getOverview(),
    );
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
