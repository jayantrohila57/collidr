import "server-only";

import type { ActionName } from "@loftlancer/actions";
import { requirePageAction, runPageGuard } from "@loftlancer/api/page-guards";
import {
  type RequirePageSessionResult,
  requirePageSession,
} from "@loftlancer/auth/guards";
import {
  type AuthSession,
  getSessionActiveOrganizationId,
} from "@loftlancer/auth/session-types";
import { DEFAULT_AUTH_URL } from "@loftlancer/env/platform";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-auth";

const appOrigin = (
  process.env.NEXT_PUBLIC_AUTH_URL ??
    process.env.NEXT_PUBLIC_ACCOUNT_URL ??
    DEFAULT_AUTH_URL
).replace(/\/$/, "");

async function currentReturnPath(): Promise<string> {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");
  if (pathname?.startsWith("/")) {
    return pathname;
  }
  return "/settings";
}

export async function guardAuthenticatedPage(): Promise<AuthSession> {
  const session = await getServerSession();
  const returnPath = await currentReturnPath();
  const result: RequirePageSessionResult = requirePageSession(session, {
    appOrigin,
    returnPath,
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
  action: ActionName,
  partial: {
    organizationId?: string | null;
    projectId?: string | null;
    targetUserId?: string | null;
  } = {},
): Promise<AuthSession> {
  const session = await guardAuthenticatedPage();
  await runPageGuard(() =>
    requirePageAction(action, {
      userId: session.user.id,
      organizationId:
        partial.organizationId ?? getSessionActiveOrganizationId(session),
      projectId: partial.projectId ?? null,
      targetUserId: partial.targetUserId ?? null,
    }),
  );
  return session;
}
