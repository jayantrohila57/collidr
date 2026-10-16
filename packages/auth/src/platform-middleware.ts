import { type NextRequest, NextResponse } from "next/server";
import { readOttFromSearchParams, stripOttFromPath } from "./cross-app-session";
import { trimTrailingSlash } from "./platform-urls";
import { hasSessionCookieFromAnyPrefix } from "./session-cookies";

export type PlatformMiddlewareOptions = {
  /** Paths that require a session (prefix match). */
  protectedPrefixes: string[];
  /** Absolute URL of this app (e.g. studio origin). */
  appOrigin: string;
};

/** Signed-out visitors go to the public landing (site root, #302). */
export function buildLandingUrl(appOrigin: string): string {
  const docs = process.env.NEXT_PUBLIC_DOCS_URL?.trim();
  if (docs) return `${trimTrailingSlash(docs)}/`;
  return new URL("/", `${trimTrailingSlash(appOrigin)}/`).toString();
}

export function platformSessionMiddleware(
  request: NextRequest,
  options: PlatformMiddlewareOptions,
): NextResponse | undefined {
  const { pathname, search } = request.nextUrl;
  const signedIn = hasSessionCookieFromAnyPrefix(request.headers);
  const ott = readOttFromSearchParams(request.nextUrl.searchParams);

  if (ott && !pathname.startsWith("/api/auth/establish-session")) {
    // nextUrl.clone() keeps the app's Next basePath (e.g. `/studio`).
    const establish = request.nextUrl.clone();
    establish.pathname = "/api/auth/establish-session";
    establish.search = "";
    establish.searchParams.set("ott", ott);
    const cleaned = stripOttFromPath(pathname, search);
    establish.searchParams.set("next", cleaned || "/");
    return NextResponse.redirect(establish);
  }

  const isProtected = options.protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (signedIn || !isProtected) {
    return undefined;
  }

  return NextResponse.redirect(buildLandingUrl(options.appOrigin));
}
