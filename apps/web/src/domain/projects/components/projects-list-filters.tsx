"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { DataTableClearFiltersButton } from "@/components/data-table/data-table-clear-filters-button";
import { DataTableFilterSelect } from "@/components/data-table/data-table-filter-select";
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
  status: ProjectsStatusFilter;
  visibility: ProjectsVisibilityFilter;
  sort: ProjectsSort;
  onStatusChange: (value: ProjectsStatusFilter) => void;
  onVisibilityChange: (value: ProjectsVisibilityFilter) => void;
  onSortChange: (value: ProjectsSort) => void;
  onClear: () => void;
  filtersActive: boolean;
};

function countLabel(count: number) {
  return ` (${count})`;
}

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
}: ProjectsListFiltersProps) {
  const statusCounts = countProjectsByStatus(projects);
  const visibilityCounts = countProjectsByVisibility(projects);

  return (
    <div className={cn("flex flex-wrap items-center", layoutGapClass)}>
      <DataTableFilterSelect
        value={status}
        onValueChange={(value) => onStatusChange(value as ProjectsStatusFilter)}
        triggerIcon="activity"
        placeholder="Status"
        ariaLabel="Filter by status"
        options={[
          {
            value: "all",
            label: "All statuses",
            icon: "activity",
            suffix: countLabel(statusCounts.all),
          },
          {
            value: "active",
            label: "Active",
            icon: "statusActive",
            suffix: countLabel(statusCounts.active),
          },
          {
            value: "inactive",
            label: "Inactive",
            icon: "statusInactive",
            suffix: countLabel(statusCounts.inactive),
          },
          {
            value: "maintenance",
            label: "Maintenance",
            icon: "statusMaintenance",
            suffix: countLabel(statusCounts.maintenance),
          },
          {
            value: "archived",
            label: "Archived",
            icon: "statusArchived",
            suffix: countLabel(statusCounts.archived),
          },
        ]}
      />

      <DataTableFilterSelect
        value={visibility}
        onValueChange={(value) =>
          onVisibilityChange(value as ProjectsVisibilityFilter)
        }
        triggerIcon="globe"
        placeholder="Visibility"
        ariaLabel="Filter by visibility"
        options={[
          {
            value: "all",
            label: "All visibility",
            icon: "globe",
            suffix: countLabel(visibilityCounts.all),
          },
          {
            value: "private",
            label: "Private",
            icon: "lock",
            suffix: countLabel(visibilityCounts.private),
          },
          {
            value: "public",
            label: "Public",
            icon: "globe",
            suffix: countLabel(visibilityCounts.public),
          },
        ]}
      />

      <DataTableFilterSelect
        value={sort}
        onValueChange={(value) => onSortChange(value as ProjectsSort)}
        triggerIcon="listView"
        placeholder="Sort"
        ariaLabel="Sort projects"
        options={[
          {
            value: "updated-desc",
            label: "Updated (newest)",
            icon: "calendar",
          },
          {
            value: "updated-asc",
            label: "Updated (oldest)",
            icon: "calendar",
          },
          { value: "name-asc", label: "Name (A–Z)", icon: "listView" },
          { value: "name-desc", label: "Name (Z–A)", icon: "listView" },
        ]}
      />

      {filtersActive ? <DataTableClearFiltersButton onClick={onClear} /> : null}
    </div>
  );
}
