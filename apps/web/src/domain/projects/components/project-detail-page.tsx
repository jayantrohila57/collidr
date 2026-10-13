"use client";

import { ErrorState } from "@/components/patterns/error-state";
import { StatusBadge } from "@/components/patterns/status-badge";
import DashboardSection from "@/components/section-dashboard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";
import { useEnvironments } from "@/domain/environments/hooks/use-environments";
import { ProjectActions } from "./project-actions";
import ProjectDetail from "./project-detail";

interface ProjectDetailPageProps {
  slug: string;
  initialName: string;
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
      {isPublic ? (
        <Badge variant="outline">Public</Badge>
      ) : (
        <Badge variant="secondary">Private</Badge>
      )}
      {isArchived && <Badge variant="secondary">Archived</Badge>}
      <StatusBadge status={status} />
    </div>
  );
}

export default function ProjectDetailPage({
  slug,
  initialName,
}: ProjectDetailPageProps) {
  const { project, status } = useEnvironments(slug);

  if (status === "loading") {
    return (
      <DashboardSection
        title={initialName}
        titleAccessory={
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        }
        action={<Skeleton className="size-7 rounded-md" />}
      >
        <ProjectDetailSkeleton />
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
    <DashboardSection
      title={project.name}
      titleAccessory={
        <ProjectHeaderBadges
          isPublic={project.isPublic}
          isArchived={project.isArchived}
          status={project.status}
        />
      }
      action={<ProjectActions project={project} />}
    >
      <ProjectDetail projectSlug={slug} project={project} />
    </DashboardSection>
  );
}
