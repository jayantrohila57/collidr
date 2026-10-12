"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { Folder, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
  const { projects, status } = useProjects();

  // Categorize projects on the frontend
  const categorizedProjects = useMemo(() => {
    if (status !== "success" || !projects.length)
      return {
        active: [],
        inactive: [],
        maintenance: [],
        archived: [],
      };

    const categories = {
      active: projects.filter((p) => p.status === "active" && !p.isArchived),
      inactive: projects.filter(
        (p) => p.status === "inactive" && !p.isArchived,
      ),
      maintenance: projects.filter(
        (p) => p.status === "maintenance" && !p.isArchived,
      ),
      archived: projects.filter((p) => p.isArchived),
    };

    return categories;
  }, [projects, status]);

  const projectCategories: ProjectCategory[] = [
    {
      title: "Active Projects",
      count: categorizedProjects.active?.length || 0,
      projects: categorizedProjects.active || [],
      icon: <div className="h-2 w-2 rounded-full bg-green-500" />,
      defaultOpen: true,
    },
    {
      title: "Maintenance Projects",
      count: categorizedProjects.maintenance?.length || 0,
      projects: categorizedProjects.maintenance || [],
      icon: <div className="h-2 w-2 rounded-full bg-yellow-500" />,
    },
    {
      title: "Inactive Projects",
      count: categorizedProjects.inactive?.length || 0,
      projects: categorizedProjects.inactive || [],
      icon: <div className="h-2 w-2 rounded-full bg-gray-500" />,
    },
    {
      title: "Archived Projects",
      count: categorizedProjects.archived?.length || 0,
      projects: categorizedProjects.archived || [],
      icon: <div className="h-2 w-2 rounded-full bg-orange-500" />,
    },
  ];

  switch (status) {
    case "loading":
      return <ProjectsSkeleton />;
    case "error":
      return (
        <div className="rounded-lg border border-destructive/50 p-8 text-center text-destructive">
          <p className="mb-4">Failed to load projects. Please try again.</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            Retry
          </Button>
        </div>
      );
    case "empty":
      return (
        <Empty className="h-full w-full border-2 border-muted-foreground/20 border-dashed bg-muted/30">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Plus className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Create your first project to start managing environment variables.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/dashboard/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
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
                <div className="flex items-center gap-3">
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
                  <Empty className="h-full w-full border-2 border-muted-foreground/20 border-dashed bg-muted/30">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Folder className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No {category.title.toLowerCase()}</EmptyTitle>
                      <EmptyDescription>
                        There are no projects in this category.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Link href="/dashboard/projects/new">
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Project
                        </Button>
                      </Link>
                    </EmptyContent>
                  </Empty>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
  }
}
