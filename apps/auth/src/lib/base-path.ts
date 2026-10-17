import type { NextRequest } from "next/server";

/** Next.js basePath of this app (e.g. `/studio`), empty in local multi-port dev. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(
  /\/$/,
  "",
);

/** Prefix a root-relative path with the app basePath (for fetch / window.location). */
export function withBasePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return path;
  }
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) {
    return path;
  }
  return `${BASE_PATH}${path}`;
}

/** Absolute URL for an in-app path that keeps the basePath (server redirects). */
export function appUrl(request: NextRequest, path: string): URL {
  // Plain URL (not NextURL): route handlers may report an empty nextUrl.basePath,
  // so add BASE_PATH explicitly.
  const parsed = new URL(path.startsWith("/") ? path : "/", "http://local");
  const target = new URL(withBasePath(parsed.pathname), request.nextUrl.origin);
  target.search = parsed.search;
  return target;
}
