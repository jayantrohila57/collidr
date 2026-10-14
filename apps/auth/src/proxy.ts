import { platformSessionMiddleware } from "@collidr/auth/platform-middleware";
import { DEFAULT_AUTH_URL } from "@collidr/env/platform";
import { resolvePublicServiceUrl } from "@collidr/env/vercel-services";
import { type NextRequest, NextResponse } from "next/server";

const appOrigin = (
  process.env.NEXT_PUBLIC_AUTH_URL ??
  (process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("auth")
    : DEFAULT_AUTH_URL)
).replace(/\/$/, "");

const LEGACY_TAB_PATHS: Record<string, string> = {
  profile: "/settings/profile",
  sessions: "/settings/sessions",
  accounts: "/settings/accounts",
  export: "/settings/danger",
  delete: "/settings/danger",
  timeline: "/settings/timeline",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/account" || pathname.startsWith("/account/")) {
    const suffix = pathname.replace(/^\/account/, "") || "";
    return NextResponse.redirect(new URL(`/settings${suffix}`, request.url));
  }

  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    const tab = request.nextUrl.searchParams.get("tab");
    if (tab && LEGACY_TAB_PATHS[tab]) {
      return NextResponse.redirect(new URL(LEGACY_TAB_PATHS[tab], request.url));
    }
    if (
      pathname === "/settings/deploy" ||
      pathname === "/settings/organization"
    ) {
      return NextResponse.redirect(new URL("/settings/profile", request.url));
    }
  }

  const gated = platformSessionMiddleware(request, {
    appOrigin,
    protectedPrefixes: ["/settings"],
  });
  if (gated) {
    return gated;
  }
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ["/settings/:path*", "/account/:path*"],
};
