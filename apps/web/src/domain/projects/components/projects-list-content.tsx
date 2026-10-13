"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { useCallback, useMemo, useState } from "react";
import { projectsTableEmpty } from "@/components/data-table/data-table-empty-presets";
import { waitForClientTableRefresh } from "@/components/data-table/data-table-filter-refetch";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { AppIcon } from "@/components/patterns/app-icon";
import { EmptyState } from "@/components/patterns/empty-state";
import { Button } from "@/components/ui/button";
import { appIcons } from "@/lib/icons";
import { layoutSectionStackClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import { useProjectsListParams } from "../hooks/use-projects-list-params";
import { filterAndSortProjects } from "../lib/filter-projects";
import { ProjectsGridView } from "./projects-grid-view";
import { ProjectsListFiltersBar } from "./projects-list-filters";
import { ProjectsTableView } from "./projects-table-view";
import { ProjectsViewToggle } from "./projects-view-toggle";

type ProjectsListContentProps = {
  projects: ProjectOutput[];
  onCreateProject?: () => void;
};

export function ProjectsListContent({
  projects,
  onCreateProject,
}: ProjectsListContentProps) {
  const params = useProjectsListParams();
  const [filterTableLoading, setFilterTableLoading] = useState(false);

  const withFilterApply = useCallback(
    async (apply: () => void | Promise<void>) => {
      setFilterTableLoading(true);
      try {
        await apply();
        await waitForClientTableRefresh();
      } finally {
        setFilterTableLoading(false);
      }
    },
    [],
  );

  const filtered = useMemo(
    () =>
      filterAndSortProjects(projects, {
        search: params.search,
        status: params.status,
        visibility: params.visibility,
        sort: params.sort,
      }),
    [params.search, params.sort, params.status, params.visibility, projects],
  );

  const newProjectButton = onCreateProject ? (
    <Button type="button" size="sm" className="gap-2" onClick={onCreateProject}>
      <AppIcon name="plus" className="text-current" />
      New project
    </Button>
  ) : null;

  const emptyNoResults = (
    <EmptyState
      icon={appIcons.searchEmpty}
      title="No matching projects"
      description="Try adjusting search or filters, or clear filters from the toolbar above."
    />
  );

  return (
    <div className={cn(layoutSectionStackClass)}>
      <DataTableToolbar
        searchPlaceholder="Search projects…"
        searchValue={params.search}
        onSearchChange={params.setSearch}
        filter={
          <ProjectsListFiltersBar
            projects={projects}
            status={params.status}
            visibility={params.visibility}
            sort={params.sort}
            onStatusChange={(value) =>
              withFilterApply(() => params.setStatus(value))
            }
            onVisibilityChange={(value) =>
              withFilterApply(() => params.setVisibility(value))
            }
            onSortChange={(value) =>
              withFilterApply(() => params.setSort(value))
            }
            onClear={params.clearFilters}
            filtersActive={params.filtersActive}
            tableLoading={filterTableLoading}
          />
        }
        trailing={
          <ProjectsViewToggle
            view={params.view}
            onViewChange={params.setView}
          />
        }
        primaryAction={newProjectButton}
      />

      {filtered.length === 0 ? (
        params.filtersActive ? (
          emptyNoResults
        ) : null
      ) : params.view === "grid" ? (
        <ProjectsGridView projects={filtered} />
      ) : (
        <ProjectsTableView
          projects={filtered}
          caption="All projects"
          captionSrOnly
          searchable={false}
          isLoading={filterTableLoading}
          filterActive={params.filtersActive}
          onCreateProject={onCreateProject}
          empty={projectsTableEmpty(newProjectButton ?? undefined)}
        />
      )}
    </div>
  );
}
