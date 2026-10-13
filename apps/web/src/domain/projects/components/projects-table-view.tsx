"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { projectsTableEmpty } from "@/components/data-table/data-table-empty-presets";
import type { DataTableEmptyConfig } from "@/components/data-table/data-table-empty-types";
import { AppIcon } from "@/components/patterns/app-icon";
import { Button } from "@/components/ui/button";
import { createProjectsTableColumns } from "./projects-table-columns";

interface ProjectsTableViewProps {
  projects: ProjectOutput[];
  isLoading?: boolean;
  caption?: string;
  searchable?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  limitRows?: number;
  captionSrOnly?: boolean;
  empty?: DataTableEmptyConfig;
  onCreateProject?: () => void;
}

export function ProjectsTableView({
  projects,
  isLoading,
  caption,
  searchable = true,
  enablePagination = true,
  pageSize = 10,
  limitRows,
  captionSrOnly,
  empty,
  onCreateProject,
}: ProjectsTableViewProps) {
  const columns = useMemo(() => createProjectsTableColumns(), []);
  const data = limitRows ? projects.slice(0, limitRows) : projects;

  const emptyConfig =
    empty ??
    projectsTableEmpty(
      onCreateProject ? (
        <Button
          type="button"
          size="sm"
          className="gap-2"
          onClick={onCreateProject}
        >
          <AppIcon name="plus" className="text-current" />
          New project
        </Button>
      ) : undefined,
    );

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      empty={emptyConfig}
      caption={caption}
      captionSrOnly={captionSrOnly}
      framed
      compactLayout
      searchable={searchable}
      searchPlaceholder="Search projects…"
      enablePagination={enablePagination && !limitRows}
      pageSize={pageSize}
    />
  );
}
