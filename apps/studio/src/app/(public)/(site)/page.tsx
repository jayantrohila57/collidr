import { hasSessionCookieFromAnyPrefix } from "@loftlancer/auth/session-cookies";
import { buildSignInUrl, defaultStudioReturnTo } from "@loftlancer/ui/auth-links";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const headerList = await headers();
  const signedIn = hasSessionCookieFromAnyPrefix(headerList);

  if (signedIn) {
    redirect("/dashboard" as Route);
  }

  redirect(
    buildSignInUrl({ returnTo: defaultStudioReturnTo() }) as Route,
  );
}
