import { isCrossOriginReturnTo } from "@collidr/auth";
import { validateReturnTo } from "@collidr/auth/return-to";
import { env } from "@collidr/env/server";
import { resolveAuthPublicUrl } from "@collidr/env/vercel-services";
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
    const finish = new URL("/api/auth/cross-app/finish", authPublicOrigin);
    finish.searchParams.set("return_to", returnTo);
    redirect(finish.toString() as Route);
  }

  try {
    const target = new URL(returnTo);
    if (target.origin === authPublicOrigin) {
      redirect(
        `${target.pathname}${target.search}${target.hash}` as Route,
      );
    }
  } catch {
    redirect("/settings/profile" as Route);
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
