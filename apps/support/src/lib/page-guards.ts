import "server-only";

import {
  requirePageSession,
  type RequirePageSessionResult,
} from "@env-manager/auth/guards";
import type { AuthSession } from "@env-manager/auth/session-types";
import { DEFAULT_SUPPORT_URL } from "@env-manager/env/platform";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { siblingAuth } from "@/lib/sibling-auth";
import { cache } from "react";

const appOrigin = (
  process.env.NEXT_PUBLIC_SUPPORT_URL ?? DEFAULT_SUPPORT_URL
).replace(/\/$/, "");

const getServerSession = cache(async () => {
  const headerList = await headers();
  return siblingAuth.api.getSession({ headers: headerList });
});

async function currentReturnPath(): Promise<string> {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");
  return pathname?.startsWith("/") ? pathname : "/tickets";
}

export async function guardAuthenticatedPage(): Promise<AuthSession> {
  const session = await getServerSession();
  const result: RequirePageSessionResult = requirePageSession(session, {
    appOrigin,
    returnPath: await currentReturnPath(),
    mode: "platform",
  });
  if ("kind" in result && result.kind === "redirect") {
    redirect(result.url as Route);
  }
  if (!("ok" in result) || !result.ok) {
    redirect("/" as Route);
  }
  return result.session;
}
