import "server-only";

import {
  requireConsoleOperatorPage,
  runPageGuard,
} from "@collidr/api/page-guards";
import {
  type RequirePageSessionResult,
  requirePageSession,
} from "@collidr/auth/guards";
import type { AuthSession } from "@collidr/auth/session-types";
import { buildSignInUrl, defaultConsoleReturnTo } from "@collidr/ui/auth-links";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-auth";

function consoleOrigin(): string {
  return new URL(defaultConsoleReturnTo()).origin;
}

async function currentReturnPath(): Promise<string> {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");
  if (pathname?.startsWith("/dashboard")) {
    return pathname;
  }
  return "/dashboard";
}

export async function guardConsoleAuthenticatedPage(): Promise<AuthSession> {
  const session = await getServerSession();
  const returnPath = await currentReturnPath();
  const result: RequirePageSessionResult = requirePageSession(session, {
    appOrigin: consoleOrigin(),
    returnPath,
    mode: "platform",
  });

  if ("kind" in result && result.kind === "redirect") {
    const returnTo = `${consoleOrigin()}${returnPath}`;
    redirect(buildSignInUrl({ returnTo }) as Route);
  }
  if (!("ok" in result) || !result.ok) {
    redirect(buildSignInUrl({ returnTo: defaultConsoleReturnTo() }) as Route);
  }
  return result.session;
}

export async function guardConsoleOperatorPage(): Promise<AuthSession> {
  const session = await guardConsoleAuthenticatedPage();
  await runPageGuard(() => requireConsoleOperatorPage(session));
  return session;
}

export async function guardSupportManagerPage(): Promise<AuthSession> {
  const session = await guardConsoleAuthenticatedPage();
  const { requireSupportManagerPage } = await import(
    "@collidr/api/page-guards"
  );
  await runPageGuard(() => requireSupportManagerPage(session.user.id));
  return session;
}

export async function guardSupportTicketPage(
  ticketId: string,
): Promise<AuthSession> {
  const session = await guardConsoleAuthenticatedPage();
  const { requireSupportTicketPage } = await import("@collidr/api/page-guards");
  await runPageGuard(() =>
    requireSupportTicketPage(session.user.id, ticketId),
  );
  return session;
}
