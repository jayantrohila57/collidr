import type { Route } from "next";

export type PageBackHref = Route;

/** Top-level dashboard routes that use browser history back with a fallback parent. */
const HISTORY_ROOT_PATHS = new Set<PageBackHref>([
  "/dashboard",
  "/dashboard/projects",
  "/dashboard/organizations",
  "/settings",
  "/dashboard/notifications",
  "/dashboard/activity",
]);

export function isDashboardRootPath(pathname: string): boolean {
  return HISTORY_ROOT_PATHS.has(pathname as PageBackHref);
}

/**
 * Logical parent for the in-page back button (direct navigation).
 * Root history routes return `null` — use {@link getPageBackFallback} instead.
 */
export function getPageBackHref(pathname: string): PageBackHref | null {
  if (isDashboardRootPath(pathname)) {
    return null;
  }

  if (pathname === "/dashboard/activity") {
    return "/dashboard";
  }

  if (pathname === "/dashboard/notifications") {
    return "/dashboard";
  }

  if (pathname === "/settings") {
    return "/dashboard";
  }

  if (pathname === "/settings/organization") {
    return "/dashboard/organizations";
  }

  const organizationDetail = /^\/dashboard\/organizations\/([^/]+)$/.exec(
    pathname,
  );
  if (organizationDetail) {
    return "/dashboard/organizations";
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

/** Fallback when `router.back()` has no prior history entry. */
export function getPageBackFallback(pathname: string): PageBackHref {
  if (pathname === "/dashboard") {
    return "/";
  }
  const parent = getPageBackHref(pathname);
  return parent ?? "/dashboard";
}
