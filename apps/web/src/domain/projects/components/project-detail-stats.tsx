"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type StatCardItem,
  StatCardRow,
  StatCardRowSkeleton,
} from "@/components/patterns/stat-card";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import { formatRelativeShort } from "@/lib/format-relative-short";
import { trpc } from "@/utils/trpc";

export function ProjectDetailStats({ slug }: { slug: string }) {
  const queryEnabled = useOrgQueryEnabled();
  const { data, isPending, isError } = useQuery({
    ...trpc.dashboard.getProjectDetailStats.queryOptions({ slug }),
    enabled: queryEnabled && Boolean(slug),
  });

  if (isPending || !queryEnabled) {
    return <StatCardRowSkeleton count={4} />;
  }

  if (isError || !data) {
    return null;
  }

  const updatedLabel = formatRelativeShort(data.updatedAt);

  const visibility = data.isPublic ? "Public" : "Private";
  const statusLabel = data.isArchived
    ? "Archived"
    : data.status.replace(/^./, (c) => c.toUpperCase());

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
      value: visibility,
      hint: statusLabel,
      icon: data.isPublic ? "globe" : "lock",
    },
  ];

  return <StatCardRow items={items} />;
}
