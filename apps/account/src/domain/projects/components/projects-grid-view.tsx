"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { Frame } from "@/components/ui/frame";
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
    <Frame className="w-full min-w-0 max-w-full overflow-hidden rounded-xl">
      <div
        className={cn(
          "grid w-full min-w-0 auto-rows-fr grid-cols-1 items-stretch sm:grid-cols-2 xl:grid-cols-3 [&>*]:w-full [&>*]:min-w-0",
          layoutGapClass,
          className,
        )}
      >
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex h-full min-h-0 w-full min-w-0 self-stretch"
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </Frame>
  );
}
