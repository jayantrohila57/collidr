"use client";

import { DataTableFilterSelect } from "@/components/data-table/data-table-filter-select";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import type {
  OrganizationsSort,
  OrganizationsTypeFilter,
} from "../lib/filter-organizations";

type OrganizationsListFiltersBarProps = {
  type: OrganizationsTypeFilter;
  sort: OrganizationsSort;
  onTypeChange: (value: OrganizationsTypeFilter) => void;
  onSortChange: (value: OrganizationsSort) => void;
};

export function OrganizationsListFiltersBar({
  type,
  sort,
  onTypeChange,
  onSortChange,
}: OrganizationsListFiltersBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center", layoutGapClass)}>
      <DataTableFilterSelect
        value={type}
        onValueChange={(value) =>
          onTypeChange(value as OrganizationsTypeFilter)
        }
        triggerIcon="organization"
        placeholder="Type"
        ariaLabel="Filter by workspace type"
        options={[
          { value: "all", label: "All types", icon: "organization" },
          { value: "team", label: "Team", icon: "member" },
          { value: "personal", label: "Personal", icon: "user" },
        ]}
      />
      <DataTableFilterSelect
        value={sort}
        onValueChange={(value) => onSortChange(value as OrganizationsSort)}
        triggerIcon="listView"
        placeholder="Sort"
        ariaLabel="Sort organizations"
        options={[
          { value: "name-asc", label: "Name (A–Z)", icon: "listView" },
          { value: "name-desc", label: "Name (Z–A)", icon: "listView" },
          { value: "slug-asc", label: "Slug (A–Z)", icon: "listView" },
        ]}
      />
    </div>
  );
}
