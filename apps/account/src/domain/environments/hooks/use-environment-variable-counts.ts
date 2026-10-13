"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { trpc } from "@/utils/trpc";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useEnvironmentVariableCounts(environmentIds: string[]) {
  const persistedIds = environmentIds.filter((id) => UUID_RE.test(id));

  const { data, isSuccess } = useQuery({
    ...trpc.environmentVariables.countsByEnvironment.queryOptions({
      environmentIds: persistedIds,
    }),
    enabled: persistedIds.length > 0,
    staleTime: 60_000,
    meta: { toastOnError: false },
  });

  return useMemo(() => {
    const counts: Record<string, number | undefined> = {};
    const map = isSuccess ? data?.data : undefined;
    for (const id of persistedIds) {
      counts[id] = map?.[id];
    }
    return counts;
  }, [persistedIds, data?.data, isSuccess]);
}
