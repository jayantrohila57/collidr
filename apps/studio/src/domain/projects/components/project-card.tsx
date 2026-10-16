"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import type { Route } from "next";
import Link from "next/link";
import { AppIcon } from "@/components/patterns/app-icon";
import {
  StatusBadge,
  VisibilityBadge,
} from "@/components/patterns/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/format";
import { initialsFromLabel } from "@/lib/initials";
import { prefetchProjectDetail } from "@/lib/prefetch-project-detail";
import { routes } from "@/utils/navigation";
import { queryClient } from "@/utils/trpc";
import { useOrgSlug } from "@/utils/use-route-scope";
import { ProjectActions } from "./project-actions";

export function ProjectCard({ project }: { project: ProjectOutput }) {
  const org = useOrgSlug();
  const href = routes.project(org, project.slug);
  const description = project.description?.trim() || "No description";

  return (
    <Card className="flex h-full w-full min-w-0 flex-col">
      <CardHeader className="gap-2 p-4 pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-muted font-medium text-xs">
              {initialsFromLabel(project.name, "PR")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={href}
                className="truncate font-medium text-sm leading-tight hover:underline"
                onMouseEnter={() =>
                  prefetchProjectDetail(queryClient, project.slug)
                }
                onFocus={() => prefetchProjectDetail(queryClient, project.slug)}
              >
                {project.name}
              </Link>
              <ProjectActions project={project} />
            </div>
            <p
              className="mt-1 line-clamp-2 text-muted-foreground text-xs"
              title={description}
            >
              {description}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <VisibilityBadge isPublic={project.isPublic} />
              {project.isArchived ? (
                <StatusBadge status="archived" />
              ) : (
                <StatusBadge status={project.status} />
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardPanel className="mt-auto flex flex-wrap items-center justify-between gap-2 px-4 pt-0 pb-4 text-muted-foreground text-xs">
        <span className="tabular-nums">
          Updated {formatDate(project.updatedAt)}
        </span>
        <div className="flex items-center gap-0.5">
          {project.repositoryUrl ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
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
              </TooltipTrigger>
              <TooltipContent>Repository</TooltipContent>
            </Tooltip>
          ) : null}
          {project.websiteUrl ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
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
                <AppIcon
                  name="externalLink"
                  className="size-3.5 text-current"
                />
              </TooltipTrigger>
              <TooltipContent>Website</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </CardPanel>
    </Card>
  );
}
