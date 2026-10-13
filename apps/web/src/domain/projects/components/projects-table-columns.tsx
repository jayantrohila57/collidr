"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { Calendar, Github, Globe } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
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

const col = {
  project: "w-[40%] min-w-0 max-w-[14rem] sm:max-w-none",
  status: "hidden w-24 md:table-cell",
  visibility: "hidden w-24 lg:table-cell",
  updated: "hidden w-28 xl:table-cell",
  links: "hidden w-20 2xl:table-cell",
  actions:
    "sticky end-0 z-10 w-12 bg-background shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] dark:shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.35)]",
} as const;

export function createProjectsTableColumns(): DataTableColumnDef<ProjectOutput>[] {
  return [
    columnHelper.accessor("name", {
      meta: { className: col.project },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project" />
      ),
      cell: ({ row }) => {
        const project = row.original;
        const href = hasNavigableSlug(project.slug)
          ? (`/dashboard/projects/${project.slug}` as Route)
          : null;
        const description = project.description?.trim() || "No description";
        return (
          <div className="min-w-0">
            {href ? (
              <Link href={href} className="block truncate font-medium">
                {project.name}
              </Link>
            ) : (
              <span className="block truncate font-medium">{project.name}</span>
            )}
            <span
              className="block max-w-full truncate text-muted-foreground text-xs"
              title={description}
            >
              {description}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => projectStatusLabel(row), {
      id: "status",
      meta: { className: col.status },
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
      meta: { className: col.visibility },
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
      meta: { className: col.updated },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          <Calendar className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{formatDate(String(getValue()))}</span>
        </span>
      ),
    }),
    columnHelper.display({
      id: "links",
      meta: { className: col.links },
      header: "Links",
      enableSorting: false,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex items-center gap-0.5">
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
      meta: { className: col.actions },
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => <ProjectActions project={row.original} />,
    }),
  ];
}
