"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import type { Route } from "next";
import Link from "next/link";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTableActionsColumnHeader } from "@/components/data-table/data-table-actions-column";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { AppIcon } from "@/components/patterns/app-icon";
import { StatusBadge } from "@/components/patterns/status-badge";
import { TableLeadingCell } from "@/components/patterns/table-leading-cell";
import { VisibilityBadge } from "@/components/patterns/visibility-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  project: "w-[40%] min-w-0 max-w-none sm:max-w-none",
  status: "hidden w-24 md:table-cell",
  visibility: "hidden w-28 md:table-cell",
  updated: "hidden w-28 md:table-cell",
  links: "hidden w-20 2xl:table-cell",
} as const;

export function createProjectsTableColumns(
  org: string,
): DataTableColumnDef<ProjectOutput>[] {
  return [
    columnHelper.accessor("name", {
      meta: { className: col.project },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project" />
      ),
      cell: ({ row }) => {
        const project = row.original;
        const href = hasNavigableSlug(project.slug)
          ? routes.project(org, project.slug)
          : null;
        const description = project.description?.trim() || "No description";
        return (
          <TableLeadingCell
            leading={
              <Avatar className="size-7">
                <AvatarFallback className="bg-muted font-medium text-[10px]">
                  {initialsFromLabel(project.name, "PR")}
                </AvatarFallback>
              </Avatar>
            }
          >
            {href ? (
              <Link
                href={href}
                className="block truncate font-medium"
                onMouseEnter={() =>
                  prefetchProjectDetail(queryClient, project.slug)
                }
                onFocus={() => prefetchProjectDetail(queryClient, project.slug)}
              >
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
          </TableLeadingCell>
        );
      },
    }),
    columnHelper.accessor((row) => projectStatusLabel(row), {
      id: "status",
      meta: { className: col.status },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
    }),
    columnHelper.accessor("isPublic", {
      meta: { className: col.visibility },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Visibility" />
      ),
      cell: ({ getValue }) => (
        <VisibilityBadge isPublic={Boolean(getValue())} />
      ),
    }),
    columnHelper.accessor("updatedAt", {
      meta: { className: col.updated },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ getValue }) => (
        <span className="flex items-center gap-2 text-muted-foreground text-xs">
          <AppIcon name="calendar" />
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
              <Tooltip>
                {/* Icon-only link: the accessible name lives on the anchor
                    itself (Button renders as the Link), plus a tooltip (#316). */}
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`GitHub repository for ${project.name} (opens in a new tab)`}
                      title="GitHub repository"
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
                  <AppIcon name="github" />
                </TooltipTrigger>
                <TooltipContent>GitHub repository</TooltipContent>
              </Tooltip>
            ) : null}
            {project.websiteUrl ? (
              <Tooltip>
                {/* Icon-only link: the accessible name lives on the anchor
                    itself (Button renders as the Link), plus a tooltip (#316). */}
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Website for ${project.name} (opens in a new tab)`}
                      title="Website"
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
                  <AppIcon name="externalLink" />
                </TooltipTrigger>
                <TooltipContent>Website</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <DataTableActionsColumnHeader />,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ProjectActions project={row.original} />
        </div>
      ),
    }),
  ];
}
