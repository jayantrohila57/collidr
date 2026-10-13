"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrgQueryEnabled } from "@/hooks/use-org-query-enabled";
import {
  prefetchProjectDetail,
  projectDetailQueryStaleTime,
} from "@/lib/prefetch-project-detail";
import { queryClient, trpc } from "@/utils/trpc";
import { PROJECT_SECTIONS } from "../config/project-sections";
import { ProjectSectionCard } from "./project-section-card";

function formatCountLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatEnvironmentsSectionSummary(
  environmentCount: number,
  variableCount: number,
) {
  return `${formatCountLabel(environmentCount, "environment", "environments")} · ${formatCountLabel(variableCount, "variable", "variables")}`;
}

export function ProjectOverviewSectionsSkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-[7.5rem] rounded-2xl" />
    </div>
  );
}

export function ProjectOverviewSections({ slug }: { slug: string }) {
  const queryEnabled = useOrgQueryEnabled();
  const { data, isPending, isError } = useQuery({
    ...trpc.dashboard.getProjectDetailStats.queryOptions({ slug }),
    enabled: queryEnabled && Boolean(slug),
    staleTime: projectDetailQueryStaleTime,
    gcTime: projectDetailQueryStaleTime * 2,
  });

  if (isPending || !queryEnabled) {
    return <ProjectOverviewSectionsSkeleton />;
  }

  const environmentCount = data?.environmentCount ?? 0;
  const variableCount = data?.variableCount ?? 0;
  const summary = isError
    ? "—"
    : formatEnvironmentsSectionSummary(environmentCount, variableCount);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PROJECT_SECTIONS.map((section) => (
        <ProjectSectionCard
          key={section.id}
          href={section.href(slug)}
          icon={section.icon}
          title={section.title}
          description={section.description}
          summary={section.id === "environments" ? summary : "—"}
          onPrefetch={() => prefetchProjectDetail(queryClient, slug)}
        />
      ))}
    </div>
  );
}
