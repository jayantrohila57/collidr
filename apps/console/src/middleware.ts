import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

import { consoleSignInUrl } from "@/lib/auth-url";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = Boolean(getSessionCookie(request.headers));

  if (pathname.startsWith("/forbidden")) {
    return NextResponse.next();
  }

  if (!signedIn && pathname.startsWith("/dashboard")) {
    const signIn = consoleSignInUrl(request.url);
    return NextResponse.redirect(new URL(signIn));
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
