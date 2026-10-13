"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type StatCardItem,
  StatCardRow,
  StatCardRowSkeleton,
} from "@/components/patterns/stat-card";
import {
  StatusBadge,
  VisibilityBadge,
} from "@/components/patterns/status-badge";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
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

  if (isPending || !queryEnabled) {
    return <StatCardRowSkeleton count={4} />;
  }

  if (isError || !data) {
    return null;
  }

  const updatedLabel = formatRelativeShort(data.updatedAt);

  const items: StatCardItem[] = [
    {
      label: "Environments",
      value: data.environmentCount,
      hint: "Deployment targets",
      icon: "environment",
    },
    {
      label: "Variables",
      value: data.variableCount,
      hint: "Across environments",
      icon: "variable",
    },
    {
      label: "Last updated",
      value: updatedLabel,
      hint: "Project metadata",
      icon: "calendar",
    },
    {
      label: "Visibility & status",
      value: (
        <span className="flex flex-wrap items-center gap-1.5">
          <VisibilityBadge isPublic={data.isPublic} />
          {data.isArchived ? (
            <StatusBadge status="archived" />
          ) : (
            <StatusBadge status={data.status} />
          )}
        </span>
      ),
      hint: "Project access",
      icon: data.isPublic ? "globe" : "lock",
    },
  ];

  return <StatCardRow items={items} compact />;
}
