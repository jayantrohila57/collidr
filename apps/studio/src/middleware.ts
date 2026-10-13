import { platformSessionMiddleware } from "@env-manager/auth/platform-middleware";
import { DEFAULT_STUDIO_URL } from "@env-manager/env/platform";
import { type NextRequest, NextResponse } from "next/server";

const appOrigin = (
  process.env.NEXT_PUBLIC_STUDIO_URL ?? DEFAULT_STUDIO_URL
).replace(/\/$/, "");

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/sign-in")) {
    const params = new URLSearchParams(request.nextUrl.search);
    const legacyRedirect = params.get("redirect");
    const returnPath =
      legacyRedirect?.startsWith("/") && !legacyRedirect.startsWith("//")
        ? legacyRedirect
        : "/dashboard";
    const returnTo = `${appOrigin}${returnPath}`;
    const authBase = (
      process.env.NEXT_PUBLIC_AUTH_URL ?? "https://auth-env-manager.vercel.app"
    ).replace(/\/$/, "");
    const signIn = new URL(`${authBase}/sign-in`);
    signIn.searchParams.set("return_to", returnTo);
    return NextResponse.redirect(signIn.toString());
  }

  if (pathname.startsWith("/dashboard/settings")) {
    const accountBase = (
      process.env.NEXT_PUBLIC_ACCOUNT_URL ??
      "https://account-env-manager.vercel.app"
    ).replace(/\/$/, "");
    const suffix = pathname.replace("/dashboard/settings", "/settings");
    return NextResponse.redirect(
      `${accountBase}${suffix}${request.nextUrl.search}`,
    );
  }

  const gated = platformSessionMiddleware(request, {
    appOrigin,
    protectedPrefixes: ["/dashboard"],
  });
  if (gated) {
    return gated;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-in/:path*"],
};
