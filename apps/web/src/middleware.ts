import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { SIGN_IN_PATH } from "@/lib/auth-routes";

function isSignedIn(request: NextRequest): boolean {
  return Boolean(getSessionCookie(request.headers));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signedIn = isSignedIn(request);

  if (signedIn && pathname === SIGN_IN_PATH) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!signedIn && pathname.startsWith("/dashboard")) {
    const signInUrl = new URL(SIGN_IN_PATH, request.url);
    signInUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in"],
};
