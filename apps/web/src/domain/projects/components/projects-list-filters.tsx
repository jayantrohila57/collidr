"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import type { ReactNode } from "react";
import { DataTableClearFiltersButton } from "@/components/data-table/data-table-clear-filters-button";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { AppIcon } from "@/components/patterns/app-icon";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import {
  countProjectsByStatus,
  countProjectsByVisibility,
  type ProjectsSort,
  type ProjectsStatusFilter,
  type ProjectsVisibilityFilter,
} from "../lib/filter-projects";

type ProjectsListFiltersProps = {
  projects: ProjectOutput[];
  status: ProjectsStatusFilter[];
  visibility: ProjectsVisibilityFilter[];
  sort: ProjectsSort;
  onStatusChange: (value: ProjectsStatusFilter[]) => void | Promise<void>;
  onVisibilityChange: (
    value: ProjectsVisibilityFilter[],
  ) => void | Promise<void>;
  onSortChange: (value: ProjectsSort) => void | Promise<void>;
  onClear: () => void;
  filtersActive: boolean;
  tableLoading?: boolean;
};

const STATUS_OPTIONS: {
  value: ProjectsStatusFilter;
  icon: ReactNode;
}[] = [
  { value: "active", icon: <AppIcon name="statusActive" className="size-4" /> },
  {
    value: "inactive",
    icon: <AppIcon name="statusInactive" className="size-4" />,
  },
  {
    value: "maintenance",
    icon: <AppIcon name="statusMaintenance" className="size-4" />,
  },
  {
    value: "archived",
    icon: <AppIcon name="statusArchived" className="size-4" />,
  },
];

const VISIBILITY_OPTIONS: {
  value: ProjectsVisibilityFilter;
  icon: ReactNode;
}[] = [
  { value: "private", icon: <AppIcon name="lock" className="size-4" /> },
  { value: "public", icon: <AppIcon name="globe" className="size-4" /> },
];

const SORT_OPTIONS: {
  value: ProjectsSort;
  label: string;
  icon: ReactNode;
}[] = [
  {
    value: "updated-desc",
    label: "Updated (newest)",
    icon: <AppIcon name="calendar" className="size-4" />,
  },
  {
    value: "updated-asc",
    label: "Updated (oldest)",
    icon: <AppIcon name="calendar" className="size-4" />,
  },
  {
    value: "name-asc",
    label: "Name (A–Z)",
    icon: <AppIcon name="listView" className="size-4" />,
  },
  {
    value: "name-desc",
    label: "Name (Z–A)",
    icon: <AppIcon name="listView" className="size-4" />,
  },
];

export function ProjectsListFiltersBar({
  projects,
  status,
  visibility,
  sort,
  onStatusChange,
  onVisibilityChange,
  onSortChange,
  onClear,
  filtersActive,
  tableLoading = false,
}: ProjectsListFiltersProps) {
  const statusCounts = countProjectsByStatus(projects);
  const visibilityCounts = countProjectsByVisibility(projects);

  const sortApplied =
    sort !== "updated-desc"
      ? ([sort] as ProjectsSort[])
      : ([] as ProjectsSort[]);

  return (
    <div className={cn("flex flex-wrap items-center", layoutGapClass)}>
      <DataTableFacetedFilter<ProjectsStatusFilter>
        title="Status"
        filterIcon="statusActive"
        ariaLabel="Filter by status"
        value={status}
        onValueChange={onStatusChange}
        options={STATUS_OPTIONS.map((option) => ({
          ...option,
          count: statusCounts[option.value],
        }))}
      />
      <DataTableFacetedFilter<ProjectsVisibilityFilter>
        title="Visibility"
        filterIcon="globe"
        ariaLabel="Filter by visibility"
        value={visibility}
        onValueChange={onVisibilityChange}
        options={VISIBILITY_OPTIONS.map((option) => ({
          ...option,
          count: visibilityCounts[option.value],
        }))}
      />
      <DataTableFacetedFilter<ProjectsSort>
        title="Sort"
        filterIcon="calendar"
        ariaLabel="Sort projects"
        multiple={false}
        searchable={false}
        value={sortApplied}
        onValueChange={async (next) => {
          await onSortChange(next[0] ?? "updated-desc");
        }}
        options={SORT_OPTIONS.map(({ value, label, icon }) => ({
          value,
          label,
          icon,
        }))}
      />

      {filtersActive ? (
        <DataTableClearFiltersButton
          onClick={onClear}
          disabled={tableLoading}
        />
      ) : null}
    </div>
  );
}
