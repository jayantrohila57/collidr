"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { StatusBadge } from "@/components/patterns/status-badge";
import DashboardSection from "@/components/section-dashboard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";
import { useEnvironments } from "@/domain/environments/hooks/use-environments";
import { EditProjectSheet } from "./edit-project-sheet";
import { ProjectActions } from "./project-actions";
import ProjectDetail from "./project-detail";
import { ProjectDetailStats } from "./project-detail-stats";

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

  const headerDescription =
    project?.description?.trim() || initialDescription || undefined;

  if (isLoading && !project) {
    return (
      <DashboardSection
        title={initialName}
        description={initialDescription}
        titleAccessory={
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        }
        action={<Skeleton className="size-7 rounded-md" />}
        stats={<ProjectDetailStats slug={slug} />}
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
        stats={<ProjectDetailStats slug={slug} />}
      >
        <ProjectDetail projectSlug={slug} project={project} />
      </DashboardSection>
      <EditProjectSheet
        project={project}
        open={editOpen}
        onOpenChange={handleEditOpenChange}
      />
    </>
  );
}
