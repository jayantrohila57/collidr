import { platformSessionMiddleware } from "@env-manager/auth/platform-middleware";
import { DEFAULT_SUPPORT_URL } from "@env-manager/env/platform";
import { type NextRequest, NextResponse } from "next/server";

const appOrigin = (
  process.env.NEXT_PUBLIC_SUPPORT_URL ?? DEFAULT_SUPPORT_URL
).replace(/\/$/, "");

export function middleware(request: NextRequest) {
  const gated = platformSessionMiddleware(request, {
    appOrigin,
    protectedPrefixes: ["/tickets", "/manage"],
  });
  if (gated) {
    return gated;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/tickets/:path*", "/manage/:path*"],
};
