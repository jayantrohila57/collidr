import { isCrossOriginReturnTo } from "@loftlancer/auth";
import { validateReturnTo } from "@loftlancer/auth/return-to";
import { env } from "@loftlancer/env/server";
import { resolveAuthPublicUrl } from "@loftlancer/env/vercel-services";
import { headers } from "next/headers";
import type { Route } from "next";
import { redirect } from "next/navigation";

/** Honor `return_to` when the user already has an auth-app session. */
export function redirectIfAlreadySignedIn(
  returnToRaw: string | null | undefined,
): void {
  const returnTo = validateReturnTo(returnToRaw);
  const authPublicOrigin =
    env.BETTER_AUTH_URL?.replace(/\/$/, "") ?? resolveAuthPublicUrl();

  if (isCrossOriginReturnTo(returnTo, authPublicOrigin)) {
    const finish = new URL(`${authPublicOrigin}/api/auth/cross-app/finish`);
    finish.searchParams.set("return_to", returnTo);
    redirect(finish.toString() as Route);
  }

  let target: URL | null = null;
  try {
    target = new URL(returnTo);
  } catch {
    target = null;
  }
  // Same origin (single-project deploy): return_to is absolute and already
  // includes the target app basePath (e.g. /studio/dashboard). Keep redirect()
  // outside try/catch so NEXT_REDIRECT is not swallowed.
  if (target && target.origin === new URL(authPublicOrigin).origin) {
    redirect(target.toString() as Route);
  }

  redirect("/settings/profile" as Route);
}

export async function readSignInReturnTo(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<string | null> {
  const raw = searchParams.return_to ?? searchParams.returnTo;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw[0] ?? null;
  const headerList = await headers();
  const fromHeader = headerList.get("x-return-to");
  return fromHeader;
}
