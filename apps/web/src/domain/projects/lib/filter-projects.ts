import type { ProjectOutput } from "@env-manager/api/types";

export type ProjectsStatusFilter =
  | "all"
  | "active"
  | "inactive"
  | "maintenance"
  | "archived";

export type ProjectsVisibilityFilter = "all" | "public" | "private";

export type ProjectsSort =
  | "updated-desc"
  | "updated-asc"
  | "name-asc"
  | "name-desc";

export type ProjectsListFilters = {
  search: string;
  status: ProjectsStatusFilter;
  visibility: ProjectsVisibilityFilter;
  sort: ProjectsSort;
};

export function filterAndSortProjects(
  projects: ProjectOutput[],
  filters: ProjectsListFilters,
): ProjectOutput[] {
  const query = filters.search.trim().toLowerCase();
  let result = projects;

  if (query) {
    result = result.filter((project) => {
      const haystack = [project.name, project.slug, project.description ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  if (filters.status !== "all") {
    result = result.filter((project) => {
      if (filters.status === "archived") return project.isArchived;
      if (project.isArchived) return false;
      return project.status === filters.status;
    });
  }

  if (filters.visibility !== "all") {
    result = result.filter((project) =>
      filters.visibility === "public" ? project.isPublic : !project.isPublic,
    );
  }

  const sorted = [...result];
  sorted.sort((a, b) => {
    switch (filters.sort) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "updated-asc":
        return (
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
      default:
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  });

  return sorted;
}

export function countProjectsByStatus(projects: ProjectOutput[]) {
  return {
    all: projects.length,
    active: projects.filter((p) => !p.isArchived && p.status === "active")
      .length,
    inactive: projects.filter((p) => !p.isArchived && p.status === "inactive")
      .length,
    maintenance: projects.filter(
      (p) => !p.isArchived && p.status === "maintenance",
    ).length,
    archived: projects.filter((p) => p.isArchived).length,
  };
}

export function countProjectsByVisibility(projects: ProjectOutput[]) {
  return {
    all: projects.length,
    public: projects.filter((p) => p.isPublic).length,
    private: projects.filter((p) => !p.isPublic).length,
  };
}
