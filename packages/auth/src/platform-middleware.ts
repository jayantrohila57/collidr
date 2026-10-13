import { resolvePublicServiceUrl } from "@collidr/env/vercel-services";
import { type NextRequest, NextResponse } from "next/server";
import { readOttFromSearchParams, stripOttFromPath } from "./cross-app-session";
import { DEFAULT_AUTH_URL, trimTrailingSlash } from "./platform-urls";
import { validateReturnTo } from "./return-to";
import { hasSessionCookieFromAnyPrefix } from "./session-cookies";

export type PlatformMiddlewareOptions = {
  /** Paths that require a session (prefix match). */
  protectedPrefixes: string[];
  /** Absolute URL of this app (e.g. studio origin). */
  appOrigin: string;
};

function buildAuthSignInUrl(returnTo: string): string {
  const auth = trimTrailingSlash(
    process.env.NEXT_PUBLIC_AUTH_URL ??
      (process.env.VERCEL_SERVICES === "1"
        ? resolvePublicServiceUrl("auth")
        : DEFAULT_AUTH_URL),
  );
  const params = new URLSearchParams({ return_to: returnTo });
  return `${auth}/sign-in?${params.toString()}`;
}

export function platformSessionMiddleware(
  request: NextRequest,
  options: PlatformMiddlewareOptions,
): NextResponse | undefined {
  const { pathname, search } = request.nextUrl;
  const signedIn = hasSessionCookieFromAnyPrefix(request.headers);
  const ott = readOttFromSearchParams(request.nextUrl.searchParams);

  if (ott && !pathname.startsWith("/api/auth/establish-session")) {
    const establish = new URL("/api/auth/establish-session", request.url);
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

  const returnTo = validateReturnTo(`${options.appOrigin}${pathname}${search}`);
  return NextResponse.redirect(buildAuthSignInUrl(returnTo));
}
