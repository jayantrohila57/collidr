"use client";

import { useMemo } from "react";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { EmptyState } from "@/components/patterns/empty-state";
import { ProjectsViewToggle } from "@/domain/projects/components/projects-view-toggle";
import { appIcons } from "@/lib/icons";
import { layoutSectionStackClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import { useOrganizationsListParams } from "../hooks/use-organizations-list-params";
import { filterAndSortOrganizations } from "../lib/filter-organizations";
import { OrganizationsGridView } from "./organizations-grid-view";
import { OrganizationsListFiltersBar } from "./organizations-list-filters";
import { OrganizationsTableView } from "./organizations-table-view";

type OrganizationsListContentProps = {
  onCreateOrganization?: () => void;
};

export function OrganizationsListContent({
  onCreateOrganization,
}: OrganizationsListContentProps) {
  const { orgs, activeOrganizationId } = useActiveOrganization();
  const params = useOrganizationsListParams();

  const filtered = useMemo(
    () =>
      filterAndSortOrganizations(orgs, {
        search: params.search,
        type: params.type,
        sort: params.sort,
      }),
    [orgs, params.search, params.sort, params.type],
  );

  const emptyNoResults = (
    <EmptyState
      icon={appIcons.searchEmpty}
      title="No matching organizations"
      description="Try adjusting search or filters."
      actionLabel="Clear filters"
      onAction={params.clearFilters}
    />
  );

  return (
    <div className={cn(layoutSectionStackClass)}>
      <DataTableToolbar
        searchPlaceholder="Search organizations…"
        searchValue={params.search}
        onSearchChange={params.setSearch}
        filter={
          <OrganizationsListFiltersBar
            orgs={orgs}
            type={params.type}
            sort={params.sort}
            onTypeChange={params.setType}
            onSortChange={params.setSort}
            onClear={params.clearFilters}
            filtersActive={params.filtersActive}
          />
        }
        trailing={
          <ProjectsViewToggle
            view={params.view}
            onViewChange={params.setView}
          />
        }
      />

      {filtered.length === 0 ? (
        params.filtersActive ? (
          emptyNoResults
        ) : null
      ) : params.view === "grid" ? (
        <OrganizationsGridView
          orgs={filtered}
          activeOrganizationId={activeOrganizationId}
        />
      ) : (
        <OrganizationsTableView
          orgs={filtered}
          activeOrganizationId={activeOrganizationId}
        />
      )}
    </div>
  );
}
