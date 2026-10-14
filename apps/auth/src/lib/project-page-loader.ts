import "server-only";

import { dehydrate, QueryClient } from "@tanstack/react-query";
import { cache } from "react";
import { hydrateProjectDetailQueries } from "@/lib/project-prefetch";
import { getServerSession } from "@/lib/server-auth";
import { ServerTiming } from "@/lib/server-timing";
import { projectBySlugQueryKey } from "@/lib/trpc-query-keys";

export type ProjectPageData = {
  slug: string;
  name: string;
  description?: string;
  dehydratedState: ReturnType<typeof dehydrate>;
  timingHeader: string;
};

export const loadProjectPageData = cache(
  async (slug: string): Promise<ProjectPageData | null> => {
    const timing = new ServerTiming(`/dashboard/projects/${slug}`);
    timing.logInAfter();

    const session = await timing.measure("auth", () => getServerSession());
    if (!session?.user) {
      return null;
    }

    const queryClient = new QueryClient();

    await hydrateProjectDetailQueries(queryClient, slug, session, timing);

    const projectPayload = queryClient.getQueryData(
      projectBySlugQueryKey(slug),
    ) as
      | {
          data?: {
            project?: {
              name: string;
              description: string | null;
              slug: string;
            } | null;
          };
        }
      | undefined;

    const project = projectPayload?.data?.project;
    if (!project) {
      return null;
    }

    const dehydratedState = dehydrate(queryClient);

    return {
      slug,
      name: project.name,
      description: project.description?.trim() || undefined,
      dehydratedState,
      timingHeader: timing.toHeaderValue(),
    };
  },
);
