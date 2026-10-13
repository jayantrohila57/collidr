import type { Route } from "next";

export type PageBackHref = Route;

/** Top-level routes that use browser history back with a fallback parent. */
const HISTORY_ROOT_PATHS = new Set<PageBackHref>(["/settings"]);

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

  if (pathname.startsWith("/settings/")) {
    return "/settings";
  }

  return null;
}

/** Fallback when `router.back()` has no prior history entry. */
export function getPageBackFallback(pathname: string): PageBackHref {
  if (pathname === "/settings") {
    return "/";
  }
  const parent = getPageBackHref(pathname);
  return parent ?? "/settings";
}
