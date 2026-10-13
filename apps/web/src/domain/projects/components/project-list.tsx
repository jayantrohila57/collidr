"use client";

import { Plus } from "lucide-react";
import { EmptyState } from "@/components/patterns/empty-state";
import { ErrorState } from "@/components/patterns/error-state";
import { useProjects } from "../hooks/use-projects";
import { ProjectsTableView } from "./projects-table-view";
import { ProjectsSkeleton } from "./skeletons";

interface ProjectListProps {
  onCreateProject?: () => void;
}

export default function ProjectList({ onCreateProject }: ProjectListProps) {
  const { projects, status, error, refetch } = useProjects();

  switch (status) {
    case "loading":
      return <ProjectsSkeleton />;
    case "error":
      return (
        <ErrorState
          title="Failed to load projects"
          description={
            error?.message ??
            "We could not load your projects. Please try again."
          }
          onRetry={() => void refetch()}
        />
      );
    case "empty":
      return (
        <EmptyState
          icon={Plus}
          title="No projects yet"
          description="Create your first project to start managing environment variables."
          actionLabel="Create project"
          onAction={onCreateProject}
        />
      );
    case "success":
      return (
        <ProjectsTableView
          projects={projects}
          caption="All projects"
          emptyMessage="No projects match your search."
        />
      );
  }
}
