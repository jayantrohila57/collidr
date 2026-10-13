"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { Folder, Plus } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "@/components/patterns/empty-state";
import { ErrorState } from "@/components/patterns/error-state";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useProjects } from "../hooks/use-projects";
import { ProjectCardView } from "./project-card-view";
import { ProjectsSkeleton } from "./skeletons";

interface ProjectCategory {
  title: string;
  count: number;
  projects: ProjectOutput[];
  icon: React.ReactNode;
  defaultOpen?: boolean;
}

export default function ProjectList() {
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
          actionHref="/dashboard/projects/new"
        />
      );
    case "success":
      return (
        <Accordion
          type="multiple"
          defaultValue={["Active Projects"]}
          className="space-y-4"
        >
          {projectCategories.map((category) => (
            <AccordionItem
              key={category.title}
              value={category.title}
              className="rounded-lg border"
            >
              <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span className="font-medium">{category.title}</span>
                  <span className="text-muted-foreground text-sm">
                    ({category.count})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="h-full px-4 pb-4">
                {category.projects.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {category.projects.map((project) => (
                      <ProjectCardView key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Folder}
                    title={`No ${category.title.toLowerCase()}`}
                    description="There are no projects in this category."
                    actionLabel="Create Project"
                    actionHref="/dashboard/projects/new"
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
  }
}
