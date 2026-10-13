"use client";

import type { OrgListItem } from "@/components/org/active-organization-context";
import type { ReactNode } from "react";
import { DataTableClearFiltersButton } from "@/components/data-table/data-table-clear-filters-button";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { AppIcon } from "@/components/patterns/app-icon";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import {
  countOrganizationsByType,
  type OrganizationsSort,
  type OrganizationsTypeFilter,
} from "../lib/filter-organizations";

type OrganizationsListFiltersBarProps = {
  orgs: OrgListItem[];
  type: OrganizationsTypeFilter;
  sort: OrganizationsSort;
  onTypeChange: (value: OrganizationsTypeFilter) => void | Promise<void>;
  onSortChange: (value: OrganizationsSort) => void | Promise<void>;
  onClear: () => void;
  filtersActive: boolean;
  tableLoading?: boolean;
};

type OrgTypeFacet = Exclude<OrganizationsTypeFilter, "all">;

const TYPE_OPTIONS: { value: OrgTypeFacet; icon: ReactNode }[] = [
  { value: "team", icon: <AppIcon name="member" className="size-4" /> },
  { value: "personal", icon: <AppIcon name="user" className="size-4" /> },
];

const SORT_OPTIONS: {
  value: OrganizationsSort;
  label: string;
  icon: ReactNode;
}[] = [
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
  {
    value: "slug-asc",
    label: "Slug (A–Z)",
    icon: <AppIcon name="listView" className="size-4" />,
  },
];

export function OrganizationsListFiltersBar({
  orgs,
  type,
  sort,
  onTypeChange,
  onSortChange,
  onClear,
  filtersActive,
  tableLoading = false,
}: OrganizationsListFiltersBarProps) {
  const typeCounts = countOrganizationsByType(orgs);

  const typeApplied: OrgTypeFacet[] =
    type === "all" ? [] : ([type] as OrgTypeFacet[]);

  const sortApplied: OrganizationsSort[] =
    sort === "name-asc" ? [] : [sort];

  return (
    <div className={cn("flex flex-wrap items-center", layoutGapClass)}>
      <DataTableFacetedFilter<OrgTypeFacet>
        title="Type"
        filterIcon="organization"
        ariaLabel="Filter by workspace type"
        value={typeApplied}
        onValueChange={async (next) => {
          await onTypeChange(next[0] ?? "all");
        }}
        multiple={false}
        options={TYPE_OPTIONS.map((option) => ({
          ...option,
          count: typeCounts[option.value],
        }))}
      />
      <DataTableFacetedFilter<OrganizationsSort>
        title="Sort"
        filterIcon="listView"
        ariaLabel="Sort organizations"
        multiple={false}
        value={sortApplied}
        onValueChange={async (next) => {
          await onSortChange(next[0] ?? "name-asc");
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
