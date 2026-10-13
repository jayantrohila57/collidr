"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { Github, Globe } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/patterns/status-badge";
import { TruncatedText } from "@/components/patterns/truncated-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateTime } from "@/lib/format";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export function ProjectOverviewCard({ project }: { project: ProjectOutput }) {
  const hasLinks = Boolean(project.repositoryUrl || project.websiteUrl);

  return (
    <Card>
      <CardPanel className={cn("flex flex-col", layoutGapClass)}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-base">{project.name}</CardTitle>
            <CardDescription className="font-mono text-xs">
              {project.slug}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <StatusBadge status={project.status} />
            {project.isPublic ? (
              <Badge variant="outline">Public</Badge>
            ) : (
              <Badge variant="secondary">Private</Badge>
            )}
            {project.isArchived ? (
              <Badge variant="secondary">Archived</Badge>
            ) : null}
          </div>
        </div>

        <TruncatedText
          text={project.description ?? ""}
          lines={2}
          emptyFallback="No description provided."
        />

        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDateTime(project.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Updated</dt>
            <dd>{formatDateTime(project.updatedAt)}</dd>
          </div>
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
                  <Github className="size-4" aria-hidden />
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
                  <Globe className="size-4" aria-hidden />
                  Website
                </TooltipTrigger>
                <TooltipContent>Open website</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        ) : null}
      </CardPanel>
    </Card>
  );
}
