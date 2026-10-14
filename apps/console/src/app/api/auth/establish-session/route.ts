import { type NextRequest, NextResponse } from "next/server";
import { siblingAuth } from "@/lib/sibling-auth";

export async function GET(request: NextRequest) {
  const ott = request.nextUrl.searchParams.get("ott");
  const nextPath =
    request.nextUrl.searchParams.get("next")?.trim() || "/dashboard";

  if (!ott) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const verifyResponse = await siblingAuth.api.verifyOneTimeToken({
    body: { token: ott },
    headers: request.headers,
    asResponse: true,
  });

  const redirect = NextResponse.redirect(new URL(nextPath, request.url));
  for (const cookie of verifyResponse.headers.getSetCookie()) {
    redirect.headers.append("Set-Cookie", cookie);
  }
  return redirect;
}
