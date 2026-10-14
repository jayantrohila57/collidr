import "server-only";

import { appRouter } from "@loftlancer/api/routers/index";
import type { auth } from "@loftlancer/auth";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getServerSession } from "@/lib/server-auth";
import type { ServerTiming } from "@/lib/server-timing";
import {
  projectBySlugQueryKey,
  projectDetailStatsQueryKey,
} from "@/lib/trpc-query-keys";

function environmentVariablesListQueryKey(environmentId: string) {
  return [
    ["environmentVariables", "list"],
    { input: { environmentId }, type: "query" as const },
  ] as const;
}

export async function hydrateProjectDetailQueries(
  queryClient: QueryClient,
  slug: string,
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
  timing?: ServerTiming,
) {
  const caller = appRouter.createCaller({ session });

  const measure = async <T>(name: string, fn: () => Promise<T>) =>
    timing ? timing.measure(name, fn) : fn();

  const projectRes = await measure("project", () =>
    caller.projects.getBySlug({ slug }),
  );

  const serializedProject = {
    ...projectRes,
    data: {
      ...projectRes.data,
      project: projectRes.data.project
        ? {
            ...projectRes.data.project,
            createdAt: projectRes.data.project.createdAt.toISOString(),
            updatedAt: projectRes.data.project.updatedAt.toISOString(),
          }
        : null,
      environments: projectRes.data.environments.map((env) => ({
        ...env,
        createdAt: env.createdAt.toISOString(),
        updatedAt: env.updatedAt.toISOString(),
      })),
    },
  };

  queryClient.setQueryData(projectBySlugQueryKey(slug), serializedProject);

  if (serializedProject.data.project) {
    try {
      const statsRes = await measure("stats", () =>
        caller.dashboard.getProjectDetailStats({ slug }),
      );
      queryClient.setQueryData(projectDetailStatsQueryKey(slug), statsRes);
    } catch {
      // Stats are optional for first paint; client will refetch.
    }
  }

  const firstEnvironmentId = serializedProject.data.environments[0]?.id;
  if (firstEnvironmentId) {
    const variablesRes = await measure("variables", () =>
      caller.environmentVariables.list({ environmentId: firstEnvironmentId }),
    );
    queryClient.setQueryData(
      environmentVariablesListQueryKey(firstEnvironmentId),
      variablesRes,
    );
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
