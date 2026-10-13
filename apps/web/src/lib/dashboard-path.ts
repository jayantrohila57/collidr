/** Whether the pathname is a recognized dashboard route (vs. rendered not-found). */
export function isRecognizedDashboardPath(
  pathname: string,
  projectSlugs: ReadonlySet<string>,
  projectsLoaded: boolean,
): boolean {
  if (!pathname.startsWith("/dashboard")) return true;

  const staticPaths = new Set([
    "/dashboard",
    "/dashboard/activity",
    "/dashboard/notifications",
    "/dashboard/onboarding",
    "/dashboard/projects",
    "/dashboard/projects/new",
    "/dashboard/settings",
    "/dashboard/settings/profile",
    "/dashboard/settings/sessions",
    "/dashboard/settings/accounts",
    "/dashboard/settings/export",
    "/dashboard/settings/delete",
    "/dashboard/settings/timeline",
    "/dashboard/settings/organization",
    "/dashboard/organizations",
    "/dashboard/timeline",
  ]);

  if (staticPaths.has(pathname)) return true;

  const projectDetail = /^\/dashboard\/projects\/([^/]+)$/.exec(pathname);
  if (projectDetail) {
    const slug = projectDetail[1];
    if (slug === "new" || slug === "edit") return true;
    if (!projectsLoaded) return true;
    return projectSlugs.has(slug);
  }

  const projectEdit = /^\/dashboard\/projects\/([^/]+)\/edit$/.exec(pathname);
  if (projectEdit) {
    if (!projectsLoaded) return true;
    return projectSlugs.has(projectEdit[1]);
  }

  const projectEnvironments =
    /^\/dashboard\/projects\/([^/]+)\/environments$/.exec(pathname);
  if (projectEnvironments) {
    const slug = projectEnvironments[1];
    if (slug === "new" || slug === "edit") return true;
    if (!projectsLoaded) return true;
    return projectSlugs.has(slug);
  }

  const organizationDetail = /^\/dashboard\/organizations\/([^/]+)$/.exec(
    pathname,
  );
  if (organizationDetail) {
    return true;
  }

  const organizationSection =
    /^\/dashboard\/organizations\/([^/]+)\/(members|teams|invitations|roles|settings|timeline)$/.exec(
      pathname,
    );
  if (organizationSection) {
    return true;
  }

  return false;
}
