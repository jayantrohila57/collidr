"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { ChevronDown, Folder, Plus } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "@/components/patterns/empty-state";
import { ErrorState } from "@/components/patterns/error-state";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useProjects } from "../hooks/use-projects";
import { ProjectsTableView } from "./projects-table-view";
import { ProjectsSkeleton } from "./skeletons";

interface ProjectCategory {
  title: string;
  count: number;
  projects: ProjectOutput[];
  icon: React.ReactNode;
  defaultOpen?: boolean;
}

interface ProjectListProps {
  onCreateProject?: () => void;
}

export default function ProjectList({ onCreateProject }: ProjectListProps) {
  const { projects, status, error, refetch } = useProjects();

  const categorizedProjects = useMemo(() => {
    if (status !== "success" || !projects.length)
      return {
        active: [],
        inactive: [],
        maintenance: [],
        archived: [],
      };

    return {
      active: projects.filter((p) => p.status === "active" && !p.isArchived),
      inactive: projects.filter(
        (p) => p.status === "inactive" && !p.isArchived,
      ),
      maintenance: projects.filter(
        (p) => p.status === "maintenance" && !p.isArchived,
      ),
      archived: projects.filter((p) => p.isArchived),
    };
  }, [projects, status]);

  const projectCategories: ProjectCategory[] = [
    {
      title: "Active Projects",
      count: categorizedProjects.active?.length || 0,
      projects: categorizedProjects.active || [],
      icon: <div className="h-2 w-2 rounded-full bg-green-500" aria-hidden />,
      defaultOpen: true,
    },
    {
      title: "Maintenance Projects",
      count: categorizedProjects.maintenance?.length || 0,
      projects: categorizedProjects.maintenance || [],
      icon: <div className="h-2 w-2 rounded-full bg-yellow-500" aria-hidden />,
    },
    {
      title: "Inactive Projects",
      count: categorizedProjects.inactive?.length || 0,
      projects: categorizedProjects.inactive || [],
      icon: <div className="h-2 w-2 rounded-full bg-gray-500" aria-hidden />,
    },
    {
      title: "Archived Projects",
      count: categorizedProjects.archived?.length || 0,
      projects: categorizedProjects.archived || [],
      icon: <div className="h-2 w-2 rounded-full bg-orange-500" aria-hidden />,
    },
  ];

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
          actionLabel="Create Project"
          onAction={onCreateProject}
        />
      );
    case "success":
      return (
        <div className="flex flex-col gap-6">
          {projectCategories.map((category) => (
            <Collapsible
              key={category.title}
              defaultOpen={category.defaultOpen ?? false}
              className="min-w-0"
            >
              <CollapsibleTrigger
                className={cn(
                  "group flex w-full cursor-pointer items-center gap-2 py-2 text-start",
                  "font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                )}
              >
                {category.icon}
                <span>{category.title}</span>
                <span className="text-muted-foreground text-sm">
                  ({category.count})
                </span>
                <ChevronDown
                  className="ms-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden
                />
              </CollapsibleTrigger>
              <Separator />
              <CollapsibleContent className="pt-4">
                {category.projects.length > 0 ? (
                  <ProjectsTableView
                    projects={category.projects}
                    caption={category.title}
                    emptyMessage={`No ${category.title.toLowerCase()}.`}
                  />
                ) : (
                  <EmptyState
                    icon={Folder}
                    title={`No ${category.title.toLowerCase()}`}
                    description="There are no projects in this category."
                    actionLabel="Create Project"
                    onAction={onCreateProject}
                  />
                )}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      );
  }
}
