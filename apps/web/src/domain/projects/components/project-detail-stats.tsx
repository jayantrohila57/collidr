"use client";

import { useQuery } from "@tanstack/react-query";
import { ClientRelativeTime } from "@/components/patterns/client-relative-time";
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
import { useOrgScopedQueryPlaceholder } from "@/hooks/use-org-scoped-query-placeholder";
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
    return <StatCardRowSkeleton count={4} />;
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
      label: "Variables",
      value: data.variableCount,
      hint: "Across environments",
      icon: "variable",
    },
    {
      label: "Last updated",
      value: <ClientRelativeTime value={data.updatedAt} />,
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
