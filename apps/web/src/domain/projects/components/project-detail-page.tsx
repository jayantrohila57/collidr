"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeaderMetadataSkeleton } from "@/components/layout/page-header-metadata-skeleton";
import { ErrorState } from "@/components/patterns/error-state";
import {
  StatusBadge,
  VisibilityBadge,
} from "@/components/patterns/status-badge";
import DashboardSection from "@/components/section-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnvironments } from "@/domain/environments/hooks/use-environments";
import { EditProjectSheet } from "./edit-project-sheet";
import { ProjectActions } from "./project-actions";
import { ProjectDetailStats } from "./project-detail-stats";
import { ProjectMetadataRow } from "./project-metadata-row";
import {
  ProjectOverviewSections,
  ProjectOverviewSectionsSkeleton,
} from "./project-overview-sections";

const E2E_LONG_DESCRIPTION =
  "Taskflow-style workspace for coordinating work across teams. This description is intentionally long so the page header keeps a single truncated line with an inline more control hugging the ellipsis, while metadata stays compact beside the title with repository and website links on one row without duplicate labels.";

interface ProjectDetailPageProps {
  slug: string;
  initialName: string;
  initialDescription?: string;
}

function ProjectHeaderBadges({
  isPublic,
  isArchived,
  status,
}: {
  isPublic: boolean;
  isArchived: boolean;
  status: "active" | "inactive" | "maintenance";
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <VisibilityBadge isPublic={isPublic} />
      {isArchived ? <StatusBadge status="archived" /> : null}
      {!isArchived ? <StatusBadge status={status} /> : null}
    </div>
  );
}

export default function ProjectDetailPage({
  slug,
  initialName,
  initialDescription,
}: ProjectDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editOpen, setEditOpen] = useState(false);
  const { project, status, isLoading } = useEnvironments(slug);

  useEffect(() => {
    if (searchParams.get("edit") === "1" && status === "success" && project) {
      setEditOpen(true);
    }
  }, [searchParams, status, project]);

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open);
    if (!open && searchParams.get("edit") === "1") {
      router.replace(`/dashboard/projects/${slug}`);
    }
  };

  const useE2eLongDescription = searchParams.get("e2eLongDescription") === "1";
  const headerDescription = useE2eLongDescription
    ? E2E_LONG_DESCRIPTION
    : project?.description?.trim() || initialDescription || undefined;

  if (isLoading && !project) {
    return (
      <DashboardSection
        title={initialName}
        description={
          searchParams.get("e2eLongDescription") === "1"
            ? E2E_LONG_DESCRIPTION
            : initialDescription
        }
        titleAccessory={
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        }
        action={<Skeleton className="size-7 rounded-md" />}
        metadata={<PageHeaderMetadataSkeleton />}
        stats={<ProjectDetailStats slug={slug} />}
      >
        <ProjectOverviewSectionsSkeleton />
      </DashboardSection>
    );
  }

  if (status === "error" || !project) {
    return (
      <DashboardSection title={initialName}>
        <ErrorState
          title="Project unavailable"
          description="This project could not be loaded. It may have been deleted."
          onRetry={() => window.location.reload()}
        />
      </DashboardSection>
    );
  }

  return (
    <>
      <DashboardSection
        title={project.name}
        description={headerDescription}
        titleAccessory={
          <ProjectHeaderBadges
            isPublic={project.isPublic}
            isArchived={project.isArchived}
            status={project.status}
          />
        }
        action={<ProjectActions project={project} />}
        metadata={<ProjectMetadataRow project={project} />}
        stats={<ProjectDetailStats slug={slug} />}
      >
        <ProjectOverviewSections slug={slug} />
      </DashboardSection>
      <EditProjectSheet
        project={project}
        open={editOpen}
        onOpenChange={handleEditOpenChange}
      />
    </>
  );
}
