import { platformSessionMiddleware } from "@loftlancer/auth/platform-middleware";
import { resolvePublicServiceUrl } from "@loftlancer/env/vercel-services";
import { type NextRequest, NextResponse } from "next/server";

const appOrigin = (
  process.env.NEXT_PUBLIC_CONSOLE_URL ??
  (process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("console")
    : "http://localhost:3005")
).replace(/\/$/, "");

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/forbidden")) {
    return NextResponse.next();
  }

  const gated = platformSessionMiddleware(request, {
    appOrigin,
    protectedPrefixes: ["/dashboard"],
  });
  if (gated) {
    return gated;
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
