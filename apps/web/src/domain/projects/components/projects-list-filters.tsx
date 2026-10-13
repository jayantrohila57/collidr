"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { AppIcon } from "@/components/patterns/app-icon";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <Select
        value={status}
        onValueChange={(value) => {
          if (value) onStatusChange(value as ProjectsStatusFilter);
        }}
      >
        <SelectTrigger
          className="h-8 w-full min-w-[8.5rem] sm:w-auto"
          aria-label="Filter by status"
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All statuses{countLabel(statusCounts.all)}
          </SelectItem>
          <SelectItem value="active">
            Active{countLabel(statusCounts.active)}
          </SelectItem>
          <SelectItem value="inactive">
            Inactive{countLabel(statusCounts.inactive)}
          </SelectItem>
          <SelectItem value="maintenance">
            Maintenance{countLabel(statusCounts.maintenance)}
          </SelectItem>
          <SelectItem value="archived">
            Archived{countLabel(statusCounts.archived)}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={visibility}
        onValueChange={(value) => {
          if (value) onVisibilityChange(value as ProjectsVisibilityFilter);
        }}
      >
        <SelectTrigger
          className="h-8 w-full min-w-[8.5rem] sm:w-auto"
          aria-label="Filter by visibility"
        >
          <SelectValue placeholder="Visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All visibility{countLabel(visibilityCounts.all)}
          </SelectItem>
          <SelectItem value="private">
            Private{countLabel(visibilityCounts.private)}
          </SelectItem>
          <SelectItem value="public">
            Public{countLabel(visibilityCounts.public)}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={(value) => {
          if (value) onSortChange(value as ProjectsSort);
        }}
      >
        <SelectTrigger
          className="h-8 w-full min-w-[8.5rem] sm:w-auto"
          aria-label="Sort projects"
        >
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated-desc">Updated (newest)</SelectItem>
          <SelectItem value="updated-asc">Updated (oldest)</SelectItem>
          <SelectItem value="name-asc">Name (A–Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z–A)</SelectItem>
        </SelectContent>
      </Select>

      {filtersActive ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={onClear}
        >
          <AppIcon name="searchEmpty" className="me-1 size-3.5 text-current" />
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
