"use client";

import type { Route } from "next";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateEnvironmentSheet } from "@/domain/environments/components/create-environment-sheet";
import { ProjectDetailSkeleton } from "@/domain/environments/components/skeletons";
import { useEnvironments } from "@/domain/environments/hooks/use-environments";
import ProjectDetail from "./project-detail";

interface ProjectEnvironmentsPageProps {
  slug: string;
}

function AddEnvironmentHeaderAction({
  onCreate,
  isPending,
}: {
  onCreate: (name: string) => Promise<void>;
  isPending: boolean;
}) {
  return (
    <CreateEnvironmentSheet
      onConfirm={onCreate}
      isPending={isPending}
      triggerText="Add environment"
      compactOnMobile
    />
  );
}

export default function ProjectEnvironmentsPage({
  slug,
}: ProjectEnvironmentsPageProps) {
  const {
    project,
    environments,
    status,
    isLoading,
    projectId,
    createEnvironment,
    isCreating,
  } = useEnvironments(slug);
  const backHref = `/dashboard/projects/${slug}` as Route;

  const showHeaderAction = Boolean(projectId && environments.length > 0);

  const headerAction =
    showHeaderAction && projectId ? (
      <AddEnvironmentHeaderAction
        isPending={isCreating}
        onCreate={async (name) => {
          await createEnvironment({ projectId, name });
        }}
      />
    ) : null;

  if (isLoading && !project) {
    return (
      <DashboardSection
        title="Environments"
        description="Variables and secrets per deployment target."
        back={backHref}
        action={
          <Skeleton className="size-8 rounded-md sm:h-8 sm:w-auto sm:min-w-[8.5rem]" />
        }
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
      action={headerAction}
    >
      <ProjectDetail projectSlug={slug} project={project} />
    </DashboardSection>
  );
}
