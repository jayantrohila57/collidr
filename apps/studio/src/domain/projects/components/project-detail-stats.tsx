"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type StatCardItem,
  StatCardRow,
  StatCardRowSkeleton,
} from "@/components/patterns/stat-card";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { useOrgScopedQueryPlaceholder } from "@/hooks/use-org-scoped-query-placeholder";
import { formatRelativeShort } from "@/lib/format-relative-short";
import { projectDetailQueryStaleTime } from "@/lib/prefetch-project-detail";
import { trpc } from "@/utils/trpc";

export function ProjectDetailStats({ slug }: { slug: string }) {
  const queryEnabled = useOrgQueryEnabled();
  const { data, isPending, isError } = useQuery({
    ...trpc.dashboard.getProjectDetailStats.queryOptions({ slug }),
    enabled: queryEnabled && Boolean(slug),
    staleTime: projectDetailQueryStaleTime,
    gcTime: projectDetailQueryStaleTime * 2,
  });

  const showPlaceholder = useOrgScopedQueryPlaceholder(
    queryEnabled,
    data,
    isPending,
  );

  if (showPlaceholder) {
    return <StatCardRowSkeleton count={4} compact />;
  }

  if (isError || !data) {
    return null;
  }

  const items: StatCardItem[] = [
    {
      label: "Environments",
      value: data.environmentCount,
      hint: "Deployment targets",
      icon: "environment",
    },
    {
      label: "Secrets",
      value: data.secretCount ?? 0,
      hint: "Encrypted values",
      icon: "lock",
    },
    {
      label: "Config",
      value: data.configCount ?? 0,
      hint: "Non-secret values",
      icon: "settings",
    },
  ];

  if (data.lastVariableUpdatedAt) {
    items.push({
      label: "Last variable change",
      value: formatRelativeShort(data.lastVariableUpdatedAt),
      hint: "Across environments",
      icon: "variable",
    });
  }

  return <StatCardRow items={items} compact />;
}
