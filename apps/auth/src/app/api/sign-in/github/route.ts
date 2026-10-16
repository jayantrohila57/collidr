import { validateReturnTo } from "@loftlancer/auth/return-to";
import { studioHomeUrl } from "@loftlancer/ui/auth-links";
import { type NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/base-path";
import { platformAuth } from "@/lib/platform-auth";

/**
 * Start GitHub sign-in straight from a link (#302): no sign-in screen.
 * Lands on /studio (org list). `return_to` is honoured only for the auth
 * app's own device/consent flows; validateReturnTo allowlists it.
 */
export async function GET(request: NextRequest) {
  const returnTo = validateReturnTo(
    request.nextUrl.searchParams.get("return_to"),
    { fallback: studioHomeUrl() },
  );
  const finish = appUrl(request, "/api/auth/cross-app/finish");
  finish.searchParams.set("return_to", returnTo);

  const result = await platformAuth.api.signInSocial({
    body: {
      provider: "github",
      callbackURL: finish.toString(),
      errorCallbackURL: new URL("/", request.nextUrl.origin).toString(),
    },
    headers: request.headers,
    asResponse: true,
  });
  const data = (await result
    .clone()
    .json()
    .catch(() => null)) as { url?: string } | null;
  if (!result.ok || !data?.url) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }
  const response = NextResponse.redirect(data.url);
  for (const cookie of result.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}
