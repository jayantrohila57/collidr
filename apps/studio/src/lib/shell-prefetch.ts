import "server-only";

import { prefetchWithCaller } from "@loftlancer/api/prefetch-with-caller";
import { studioRouter } from "@loftlancer/api/routers/studio";
import type { AuthSession } from "@loftlancer/auth/session-types";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { trpcQueryOptions } from "@/utils/trpc-query-options";

/** Prefetch queries shared by the private dashboard shell (sidebar, gates). */
export async function dehydrateStudioShellQueries(session: AuthSession) {
  const queryClient = new QueryClient();
  const caller = studioRouter.createCaller({ session });

  await Promise.allSettled([
    prefetchWithCaller(
      queryClient,
      trpcQueryOptions.permissions.snapshot.queryOptions({}),
      () => caller.permissions.snapshot({}),
    ),
    prefetchWithCaller(
      queryClient,
      trpcQueryOptions.projects.list.queryOptions(),
      () => caller.projects.list(),
    ),
    prefetchWithCaller(
      queryClient,
      trpcQueryOptions.notifications.unreadCount.queryOptions(),
      () => caller.notifications.unreadCount(),
    ),
    prefetchWithCaller(
      queryClient,
      trpcQueryOptions.sidebar.navigator.queryOptions({}),
      () => caller.sidebar.navigator({}),
    ),
  ]);

  return dehydrate(queryClient);
}

/** Org-scoped sidebar counts and ⌘K data for /[org]/… routes. */
export async function dehydrateOrgSidebarNavigator(
  session: AuthSession,
  orgSlug: string,
) {
  const queryClient = new QueryClient();
  const caller = studioRouter.createCaller({ session });

  await prefetchWithCaller(
    queryClient,
    trpcQueryOptions.sidebar.navigator.queryOptions({ orgSlug }),
    () => caller.sidebar.navigator({ orgSlug }),
  );

  return dehydrate(queryClient);
}
