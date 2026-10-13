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
  return (
    <dl
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <dt className="shrink-0 text-muted-foreground">Slug</dt>
        <dd className="truncate font-mono">{project.slug}</dd>
      </div>
      <span className="text-muted-foreground/40" aria-hidden>
        ·
      </span>
      <div className="flex min-w-0 items-center gap-1.5">
        <dt className="shrink-0 text-muted-foreground">Updated</dt>
        <dd className="truncate tabular-nums">
          {formatDateTime(project.updatedAt)}
        </dd>
      </div>
      {project.repositoryUrl ? (
        <>
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-1.5 text-muted-foreground hover:text-foreground"
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
              <AppIcon name="github" className="size-3.5 text-current" />
              <span className="hidden sm:inline">Repository</span>
            </TooltipTrigger>
            <TooltipContent>Open repository</TooltipContent>
          </Tooltip>
        </>
      ) : null}
      {project.websiteUrl ? (
        <>
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-1.5 text-muted-foreground hover:text-foreground"
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
              <AppIcon name="externalLink" className="size-3.5 text-current" />
              <span className="hidden sm:inline">Website</span>
            </TooltipTrigger>
            <TooltipContent>Open website</TooltipContent>
          </Tooltip>
        </>
      ) : null}
    </dl>
  );
}
