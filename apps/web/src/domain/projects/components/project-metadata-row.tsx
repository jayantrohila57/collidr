"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import type { Route } from "next";
import Link from "next/link";
import { AppIcon } from "@/components/patterns/app-icon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProjectMetadataRow({
  project,
  className,
}: {
  project: ProjectOutput;
  className?: string;
}) {
  const hasLinks = Boolean(project.repositoryUrl || project.websiteUrl);

  return (
    <div className={cn("flex min-w-0 flex-col gap-2 text-sm", className)}>
      <dl className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-[auto_1fr_auto_1fr] sm:items-center">
        <dt className="text-muted-foreground">Slug</dt>
        <dd className="truncate font-mono">{project.slug}</dd>
        <dt className="text-muted-foreground sm:ps-2">Updated</dt>
        <dd className="truncate tabular-nums">
          {formatDateTime(project.updatedAt)}
        </dd>
      </dl>

      {hasLinks ? (
        <div className="flex flex-wrap items-center gap-2">
          {project.repositoryUrl ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    render={
                      <Link
                        href={project.repositoryUrl as Route}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  />
                }
              >
                <AppIcon name="github" className="text-current" />
                Repository
              </TooltipTrigger>
              <TooltipContent>Open repository</TooltipContent>
            </Tooltip>
          ) : null}
          {project.websiteUrl ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    render={
                      <Link
                        href={project.websiteUrl as Route}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  />
                }
              >
                <AppIcon name="externalLink" className="text-current" />
                Website
              </TooltipTrigger>
              <TooltipContent>Open website</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
