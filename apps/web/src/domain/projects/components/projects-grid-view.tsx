"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./project-card";

export function ProjectsGridView({
  projects,
  className,
}: {
  projects: ProjectOutput[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3",
        layoutGapClass,
        className,
      )}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
