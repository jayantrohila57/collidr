"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import {
  type LegacyColumnDef,
  legacyCreateColumnHelper,
} from "@tanstack/react-table/legacy";
import { Calendar, Github, Globe } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { TruncatedText } from "@/components/patterns/truncated-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { ProjectActions } from "./project-actions";

const columnHelper = legacyCreateColumnHelper<ProjectOutput>();

function hasNavigableSlug(slug: string | null | undefined) {
  return Boolean(slug && slug.trim().length > 0);
}

function projectStatusLabel(project: ProjectOutput) {
  if (project.isArchived) return "Archived";
  return project.status;
}

const columns = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
    cell: ({ row }) => {
      const project = row.original;
      const href = hasNavigableSlug(project.slug)
        ? (`/dashboard/projects/${project.slug}` as Route)
        : null;
      return (
        <div>
          {href ? (
            <Link href={href}>
              <span className="font-medium">{project.name}</span>
            </Link>
          ) : (
            <span className="font-medium">{project.name}</span>
          )}
          <div className="text-muted-foreground text-sm">
            <TruncatedText
              text={project.description ?? ""}
              lines={1}
              emptyFallback="No description"
            />
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor((row) => projectStatusLabel(row), {
    id: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => (
      <Badge variant="outline" className="capitalize">
        {String(getValue())}
      </Badge>
    ),
  }),
  columnHelper.accessor("isPublic", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visibility" />
    ),
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="outline">Public</Badge>
      ) : (
        <Badge variant="secondary">Private</Badge>
      ),
  }),
  columnHelper.accessor("updatedAt", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ getValue }) => (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Calendar className="size-3" aria-hidden />
        {formatDate(String(getValue()))}
      </div>
    ),
  }),
  columnHelper.display({
    id: "links",
    header: "Links",
    enableSorting: false,
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex items-center gap-1">
          {project.repositoryUrl ? (
            <Link
              href={project.repositoryUrl as Route}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.name} repository`}
            >
              <Button variant="ghost" size="icon-sm">
                <Github className="size-4" aria-hidden />
              </Button>
            </Link>
          ) : null}
          {project.websiteUrl ? (
            <Link
              href={project.websiteUrl as Route}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.name} website`}
            >
              <Button variant="ghost" size="icon-sm">
                <Globe className="size-4" aria-hidden />
              </Button>
            </Link>
          ) : null}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    enableSorting: false,
    cell: ({ row }) => <ProjectActions project={row.original} />,
  }),
] as LegacyColumnDef<ProjectOutput, unknown>[];

interface ProjectsTableViewProps {
  projects: ProjectOutput[];
  isLoading?: boolean;
  emptyMessage?: string;
  caption?: string;
}

export function ProjectsTableView({
  projects,
  isLoading,
  emptyMessage,
  caption,
}: ProjectsTableViewProps) {
  return (
    <DataTable
      columns={columns}
      data={projects}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      caption={caption}
      framed
    />
  );
}
