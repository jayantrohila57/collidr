import { DEFAULT_ACCOUNT_URL } from "@loftlancer/env/platform";
import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { SIGN_IN_PATH } from "@/lib/auth-routes";

const accountOrigin = (
  process.env.NEXT_PUBLIC_ACCOUNT_URL ?? DEFAULT_ACCOUNT_URL
).replace(/\/$/, "");

function isSignedIn(request: NextRequest): boolean {
  return Boolean(getSessionCookie(request.headers));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signedIn = isSignedIn(request);

  if (pathname === "/dashboard/settings/timeline") {
    return NextResponse.redirect(
      new URL("/dashboard/settings?tab=timeline", request.url),
    );
  }

  if (signedIn && pathname === SIGN_IN_PATH) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard/settings")) {
    const suffix = pathname.replace("/dashboard/settings", "/settings");
    return NextResponse.redirect(`${accountOrigin}${suffix}${search}`);
  }

  if (!signedIn && pathname.startsWith("/dashboard")) {
    const signInUrl = new URL(SIGN_IN_PATH, request.url);
    signInUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in"],
};
