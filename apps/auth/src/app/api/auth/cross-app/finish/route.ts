import { appendOttToUrl, isCrossOriginReturnTo } from "@env-manager/auth";
import { validateReturnTo } from "@env-manager/auth/return-to";
import { env } from "@env-manager/env/server";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { platformAuth } from "@/lib/platform-auth";

/**
 * After GitHub OAuth on the auth app, mint a one-time token for sibling-app cookies.
 */
export async function GET(request: NextRequest) {
  const returnTo = validateReturnTo(
    request.nextUrl.searchParams.get("return_to"),
  );
  const headerList = await headers();
  const session = await platformAuth.api.getSession({ headers: headerList });

  if (!session) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("return_to", returnTo);
    return NextResponse.redirect(signIn);
  }

  if (!isCrossOriginReturnTo(returnTo, env.BETTER_AUTH_URL)) {
    return NextResponse.redirect(returnTo);
  }

  const tokenUrl = new URL(
    "/api/auth/one-time-token/generate",
    env.BETTER_AUTH_URL,
  );
  const tokenResponse = await fetch(tokenUrl, {
    headers: {
      cookie: headerList.get("cookie") ?? "",
    },
  });
  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  const { token } = (await tokenResponse.json()) as { token: string };

  return NextResponse.redirect(appendOttToUrl(returnTo, token));
}
