"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { Calendar, Folder, Github, Globe } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { TruncatedText } from "@/components/patterns/truncated-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { ProjectActions } from "./project-actions";

interface ProjectCardViewProps {
  project: ProjectOutput;
}

function hasNavigableSlug(slug: string | null | undefined) {
  return Boolean(slug && slug.trim().length > 0);
}

export function ProjectCardView({ project }: ProjectCardViewProps) {
  const formattedDate = formatDate(project.updatedAt);

  const projectHref = hasNavigableSlug(project.slug)
    ? (`/dashboard/projects/${project.slug}` as Route)
    : null;

  return (
    <Card className="min-h-0 border bg-input/30 sm:min-h-64">
      <CardHeader>
        <CardTitle className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Folder className="h-5 w-5" />
        </CardTitle>
        <CardAction className="flex items-center gap-1">
          {project.isPublic && <Badge variant="outline">Public</Badge>}
          <ProjectActions project={project} />
        </CardAction>
      </CardHeader>
      <CardHeader>
        {projectHref ? (
          <Link href={projectHref} className="group block h-full">
            <CardTitle>{project.name}</CardTitle>
          </Link>
        ) : (
          <CardTitle>{project.name}</CardTitle>
        )}
        <CardDescription>
          <TruncatedText
            text={project.description ?? ""}
            lines={2}
            emptyFallback="No description yet."
          />
        </CardDescription>
        {!projectHref && (
          <p className="text-amber-600 text-xs dark:text-amber-400">
            This project has an invalid URL slug. You can still delete it from
            the actions menu.
          </p>
        )}
      </CardHeader>
      <CardFooter className="mt-auto flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>

          {project.isArchived && <Badge variant="outline">Archived</Badge>}
        </div>

        <div className="flex items-center gap-3">
          {project.repositoryUrl && (
            <Link
              href={project.repositoryUrl as Route}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Open ${project.name} repository`}
            >
              <Button variant={"ghost"} size="icon">
                <Github className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          )}
          {project.websiteUrl && (
            <Link
              href={project.websiteUrl as Route}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Open ${project.name} website`}
            >
              <Button variant={"ghost"} size="icon">
                <Globe className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
