"use client";

import type { Route } from "next";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";
import { useEnvironments } from "@/domain/environments/hooks/use-environments";
import ProjectDetail from "./project-detail";

interface ProjectEnvironmentsPageProps {
  slug: string;
}

export default function ProjectEnvironmentsPage({
  slug,
}: ProjectEnvironmentsPageProps) {
  const { project, status, isLoading } = useEnvironments(slug);
  const backHref = `/dashboard/projects/${slug}` as Route;

  if (isLoading && !project) {
    return (
      <DashboardSection
        title="Environments"
        description="Variables and secrets per deployment target."
        back={backHref}
      >
        <ProjectDetailSkeleton />
      </DashboardSection>
    );
  }

  if (status === "error" || !project) {
    return (
      <DashboardSection title="Environments" back={backHref}>
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
      title="Environments"
      description="Variables and secrets per deployment target."
      back={backHref}
    >
      <ProjectDetail projectSlug={slug} project={project} />
    </DashboardSection>
  );
}
