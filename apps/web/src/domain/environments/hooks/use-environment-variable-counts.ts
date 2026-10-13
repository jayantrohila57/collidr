"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { trpc } from "@/utils/trpc";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useEnvironmentVariableCounts(environmentIds: string[]) {
  const persistedIds = environmentIds.filter((id) => UUID_RE.test(id));

  const queries = useQueries({
    queries: persistedIds.map((environmentId) => ({
      ...trpc.environmentVariables.list.queryOptions({ environmentId }),
      staleTime: 60_000,
      meta: { toastOnError: false },
      select: (response: { data?: unknown[] }) => response.data?.length ?? 0,
    })),
  });

  return useMemo(() => {
    const counts: Record<string, number | undefined> = {};
    persistedIds.forEach((id, index) => {
      const query = queries[index];
      counts[id] = query.isSuccess ? query.data : undefined;
    });
    return counts;
  }, [persistedIds, queries]);
}
