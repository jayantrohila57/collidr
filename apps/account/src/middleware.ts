import { platformSessionMiddleware } from "@env-manager/auth/platform-middleware";
import { DEFAULT_ACCOUNT_URL } from "@env-manager/env/platform";
import { type NextRequest, NextResponse } from "next/server";

const appOrigin = (
  process.env.NEXT_PUBLIC_ACCOUNT_URL ?? DEFAULT_ACCOUNT_URL
).replace(/\/$/, "");

export function middleware(request: NextRequest) {
  const gated = platformSessionMiddleware(request, {
    appOrigin,
    protectedPrefixes: ["/settings"],
  });
  if (gated) {
    return gated;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/settings/:path*"],
};
