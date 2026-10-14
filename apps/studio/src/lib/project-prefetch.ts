import "server-only";

import { prefetchWithCaller } from "@collidr/api/prefetch-with-caller";
import { studioRouter } from "@collidr/api/routers/studio";
import type { auth } from "@collidr/auth";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getServerSession } from "@/lib/server-auth";
import type { ServerTiming } from "@/lib/server-timing";
import { trpcQueryOptions } from "@/utils/trpc-query-options";

type ProjectBySlugPayload = Awaited<
  ReturnType<
    ReturnType<typeof studioRouter.createCaller>["projects"]["getBySlug"]
  >
>;

export async function hydrateProjectDetailQueries(
  queryClient: QueryClient,
  slug: string,
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
  timing?: ServerTiming,
): Promise<ProjectBySlugPayload> {
  const caller = studioRouter.createCaller({ session });

  const measure = async <T>(name: string, fn: () => Promise<T>) =>
    timing ? timing.measure(name, fn) : fn();

  const projectRes = await measure("project", () =>
    prefetchWithCaller(
      queryClient,
      trpcQueryOptions.projects.getBySlug.queryOptions({ slug }),
      () => caller.projects.getBySlug({ slug }),
    ),
  );

  if (projectRes.data.project) {
    try {
      await measure("stats", () =>
        prefetchWithCaller(
          queryClient,
          trpcQueryOptions.dashboard.getProjectDetailStats.queryOptions({
            slug,
          }),
          () => caller.dashboard.getProjectDetailStats({ slug }),
        ),
      );
    } catch {
      // Stats are optional for first paint; client will refetch.
    }
  }

  const firstEnvironmentId = projectRes.data.environments[0]?.id;
  if (firstEnvironmentId) {
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
  }

  return projectRes;
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
