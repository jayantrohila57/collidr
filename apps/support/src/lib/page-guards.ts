import "server-only";

import {
  requirePageAction,
  requireSupportManagerPage,
  requireSupportTicketPage,
  runPageGuard,
} from "@collidr/api/page-guards";
import {
  type RequirePageSessionResult,
  requirePageSession,
} from "@collidr/auth/guards";
import type { AuthSession } from "@collidr/auth/session-types";
import { DEFAULT_SUPPORT_URL } from "@collidr/env/platform";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { siblingAuth } from "@/lib/sibling-auth";

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

export async function guardPageAction(
  action: Parameters<typeof requirePageAction>[0],
): Promise<AuthSession> {
  const session = await guardAuthenticatedPage();
  await runPageGuard(() =>
    requirePageAction(action, { userId: session.user.id }),
  );
  return session;
}

export async function guardSupportManagerPage(): Promise<AuthSession> {
  const session = await guardAuthenticatedPage();
  await runPageGuard(() => requireSupportManagerPage(session.user.id));
  return session;
}

export async function guardSupportTicketPage(
  ticketId: string,
): Promise<AuthSession> {
  const session = await guardAuthenticatedPage();
  await runPageGuard(() => requireSupportTicketPage(session.user.id, ticketId));
  return session;
}
