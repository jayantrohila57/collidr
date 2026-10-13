"use client";

import { EmptyState } from "@/components/patterns/empty-state";
import { ErrorState } from "@/components/patterns/error-state";
import { appIcons } from "@/lib/icons";
import { useProjects } from "../hooks/use-projects";
import { ProjectsListContent } from "./projects-list-content";
import { ProjectsSkeleton } from "./skeletons";

interface ProjectListProps {
  onCreateProject?: () => void;
  list?: ReturnType<typeof useProjects>;
}

export default function ProjectList({
  onCreateProject,
  list,
}: ProjectListProps) {
  const internal = useProjects();
  const { projects, status, error, refetch } = list ?? internal;

  switch (status) {
    case "loading":
      return <ProjectsSkeleton />;
    case "error":
      return (
        <ErrorState
          title="Failed to load projects"
          safeDescriptionFallback="We could not load your projects. Please try again."
          description={error?.message}
          onRetry={() => void refetch()}
        />
      );
    case "empty":
      return (
        <EmptyState
          icon={appIcons.project}
          title="No projects yet"
          description="Create a project to manage environments and variables."
          actionLabel="New project"
          onAction={onCreateProject}
        />
      );
    case "success":
      return (
        <ProjectsListContent
          projects={projects}
          onCreateProject={onCreateProject}
        />
      );
  }
}
