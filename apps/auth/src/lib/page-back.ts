import type { Route } from "next";

export type PageBackHref = Route;

const SETTINGS_ROOT = "/settings" as Route;

/** Top-level routes that use browser history back with a fallback parent. */
const HISTORY_ROOT_PATHS = new Set<PageBackHref>([SETTINGS_ROOT]);

export function isDashboardRootPath(pathname: string): boolean {
  return HISTORY_ROOT_PATHS.has(pathname as PageBackHref);
}

export function getPageBackHref(pathname: string): PageBackHref | null {
  if (isDashboardRootPath(pathname)) {
    return null;
  }

  if (pathname.startsWith("/settings/")) {
    return SETTINGS_ROOT;
  }

  return null;
}

export function getPageBackFallback(pathname: string): PageBackHref {
  if (pathname === "/settings") {
    return "/" as Route;
  }
  const parent = getPageBackHref(pathname);
  return parent ?? SETTINGS_ROOT;
}
