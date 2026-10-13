"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createProjectsTableColumns } from "./projects-table-columns";

interface ProjectsTableViewProps {
  projects: ProjectOutput[];
  isLoading?: boolean;
  emptyMessage?: string;
  caption?: string;
  searchable?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  limitRows?: number;
  captionSrOnly?: boolean;
}

export function ProjectsTableView({
  projects,
  isLoading,
  emptyMessage,
  caption,
  searchable = true,
  enablePagination = true,
  pageSize = 10,
  limitRows,
  captionSrOnly,
}: ProjectsTableViewProps) {
  const columns = useMemo(() => createProjectsTableColumns(), []);
  const data = limitRows ? projects.slice(0, limitRows) : projects;

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
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
