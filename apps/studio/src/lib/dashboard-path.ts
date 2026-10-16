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
    "/dashboard/support",
    "/dashboard/support/tickets",
    "/dashboard/support/tickets/new",
    "/dashboard/support/help",
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
    "/dashboard/settings/deploy",
    "/dashboard/organizations",
    "/dashboard/timeline",
  ]);

  if (staticPaths.has(pathname)) return true;

  const projectDetail = /^\/p\/([^/]+)$/.exec(pathname);
  if (projectDetail) {
    const slug = projectDetail[1];
    if (slug === "new" || slug === "edit") return true;
    return true;
  }

  const projectEdit = /^\/p\/([^/]+)\/edit$/.exec(pathname);
  if (projectEdit) {
    return true;
  }

  const projectEnvironments = /^\/p\/([^/]+)\/env$/.exec(pathname);
  if (projectEnvironments) {
    const slug = projectEnvironments[1];
    if (slug === "new" || slug === "edit") return true;
    return true;
  }

  const supportTicket = /^\/dashboard\/support\/tickets\/([^/]+)$/.exec(
    pathname,
  );
  if (supportTicket) {
    return true;
  }

  const supportHelp = /^\/dashboard\/support\/help\/([^/]+)$/.exec(pathname);
  if (supportHelp) {
    return true;
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
