import "server-only";

import { appRouter } from "@env-manager/api/routers/index";
import type { auth } from "@env-manager/auth";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getServerSession } from "@/lib/server-auth";
import {
  projectBySlugQueryKey,
  projectDetailStatsQueryKey,
} from "@/lib/trpc-query-keys";

export async function hydrateProjectDetailQueries(
  queryClient: QueryClient,
  slug: string,
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
) {
  const caller = appRouter.createCaller({ session });

  const [projectRes, statsRes] = await Promise.all([
    caller.projects.getBySlug({ slug }),
    caller.dashboard.getProjectDetailStats({ slug }),
  ]);

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
  queryClient.setQueryData(projectDetailStatsQueryKey(slug), statsRes);
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
