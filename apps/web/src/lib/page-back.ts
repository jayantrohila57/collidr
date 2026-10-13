import type { Route } from "next";

export type PageBackHref = Route;

/** Top-level dashboard routes — no in-page back control. */
const ROOT_PATHS = new Set<PageBackHref>(["/dashboard", "/dashboard/projects"]);

export function isDashboardRootPath(pathname: string): boolean {
  return ROOT_PATHS.has(pathname as PageBackHref);
}

/**
 * Logical parent for the in-page back button. Returns `null` on root pages.
 */
export function getPageBackHref(pathname: string): PageBackHref | null {
  if (isDashboardRootPath(pathname)) {
    return null;
  }

  if (pathname === "/dashboard/activity") {
    return "/dashboard";
  }

  if (pathname === "/dashboard/settings") {
    return "/dashboard";
  }

  if (pathname === "/dashboard/settings/organization") {
    return "/dashboard/settings";
  }

  if (pathname === "/dashboard/projects/new") {
    return "/dashboard/projects";
  }

  const projectEdit = /^\/dashboard\/projects\/([^/]+)\/edit$/.exec(pathname);
  if (projectEdit) {
    return `/dashboard/projects/${projectEdit[1]}` as Route;
  }

  const projectDetail = /^\/dashboard\/projects\/([^/]+)$/.exec(pathname);
  if (projectDetail && !["new", "edit"].includes(projectDetail[1])) {
    return "/dashboard/projects";
  }

  if (pathname.startsWith("/dashboard/")) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 2) {
      return `/${segments.slice(0, -1).join("/")}` as Route;
    }
    return "/dashboard";
  }

  return null;
}
