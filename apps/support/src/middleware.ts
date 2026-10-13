import { platformSessionMiddleware } from "@collidr/auth/platform-middleware";
import { DEFAULT_SUPPORT_URL } from "@collidr/env/platform";
import { resolvePublicServiceUrl } from "@collidr/env/vercel-services";
import { type NextRequest, NextResponse } from "next/server";

const appOrigin = (
  process.env.NEXT_PUBLIC_SUPPORT_URL ??
  (process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("support")
    : DEFAULT_SUPPORT_URL)
).replace(/\/$/, "");

export function middleware(request: NextRequest) {
  const gated = platformSessionMiddleware(request, {
    appOrigin,
    protectedPrefixes: ["/tickets", "/manage"],
  });
  if (gated) {
    return gated;
  }
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ["/tickets/:path*", "/manage/:path*"],
};
