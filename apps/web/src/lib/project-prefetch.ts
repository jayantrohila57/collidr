import "server-only";

import { prefetchWithCaller } from "@loftlancer/api/prefetch-with-caller";
import { appRouter } from "@loftlancer/api/routers/index";
import type { auth } from "@loftlancer/auth";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getServerSession } from "@/lib/server-auth";
import type { ServerTiming } from "@/lib/server-timing";
import { trpcQueryOptions } from "@/utils/trpc-query-options";

export async function hydrateProjectDetailQueries(
  queryClient: QueryClient,
  slug: string,
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
  timing?: ServerTiming,
) {
  const caller = appRouter.createCaller({ session });

  const measure = async <T>(name: string, fn: () => Promise<T>) =>
    timing ? timing.measure(name, fn) : fn();

  const projectRes = await measure("project+stats", async () => {
    const [projectPayload] = await Promise.all([
      prefetchWithCaller(
        queryClient,
        trpcQueryOptions.projects.getBySlug.queryOptions({ slug }),
        () => caller.projects.getBySlug({ slug }),
      ),
      prefetchWithCaller(
        queryClient,
        trpcQueryOptions.dashboard.getProjectDetailStats.queryOptions({
          slug,
        }),
        () => caller.dashboard.getProjectDetailStats({ slug }),
      ).catch(() => undefined),
    ]);
    return projectPayload;
  });

  const firstEnvironmentId = projectRes.data.environments[0]?.id;
  if (firstEnvironmentId) {
    try {
      await measure("variables", () =>
        prefetchWithCaller(
          queryClient,
          trpcQueryOptions.environmentVariables.list.queryOptions({
            environmentId: firstEnvironmentId,
          }),
          () =>
            caller.environmentVariables.list({
              environmentId: firstEnvironmentId,
            }),
        ),
      );
    } catch {
      // Variables are optional for first paint; client will refetch.
    }
  }
}

export async function dehydrateProjectDetail(slug: string) {
  const queryClient = new QueryClient();
  const session = await getServerSession();
  if (!session) {
    return dehydrate(queryClient);
  }

  try {
    await hydrateProjectDetailQueries(queryClient, slug, session);
  } catch {
    // Client will refetch (e.g. missing active org).
  }

  return dehydrate(queryClient);
}
