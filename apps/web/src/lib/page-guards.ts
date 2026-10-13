import "server-only";

import type { ActionName } from "@env-manager/actions";
import {
  organizationChildAction,
  requirePageAction,
  resolveOrganizationForPage,
  resolveProjectForPage,
  runPageGuard,
} from "@env-manager/api/page-guards";
import {
  type RequirePageSessionResult,
  requirePageSession,
} from "@env-manager/auth/guards";
import {
  type AuthSession,
  getSessionActiveOrganizationId,
} from "@env-manager/auth/session-types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-auth";

function getWebAppOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://127.0.0.1:3000";
}

const appOrigin = getWebAppOrigin();

async function currentReturnPath(): Promise<string> {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");
  if (pathname?.startsWith("/")) {
    return pathname;
  }
  return "/dashboard";
}

export async function guardAuthenticatedPage(): Promise<AuthSession> {
  const session = await getServerSession();
  const returnPath = await currentReturnPath();
  const result: RequirePageSessionResult = requirePageSession(session, {
    appOrigin,
    returnPath,
    mode: "legacy",
  });
  if ("kind" in result && result.kind === "redirect") {
    redirect(result.url);
  }
  if (!("ok" in result) || !result.ok) {
    redirect("/sign-in");
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

export async function guardOrganizationSlugMembership(slug: string) {
  const session = await guardAuthenticatedPage();
  const org = await runPageGuard(() =>
    resolveOrganizationForPage(session.user.id, slug),
  );
  return { session, org };
}

export async function guardOrganizationSlugPage(
  slug: string,
  childSegment?: string,
) {
  const { session, org } = await guardOrganizationSlugMembership(slug);
  const action =
    (childSegment ? organizationChildAction(childSegment) : undefined) ??
    "organization.hub.view";
  await runPageGuard(() =>
    requirePageAction(action, {
      userId: session.user.id,
      organizationId: org.id,
    }),
  );
  return { session, org };
}

export async function guardProjectSlugPage(slug: string) {
  const session = await guardAuthenticatedPage();
  const organizationId = getSessionActiveOrganizationId(session);
  const projectRow = await runPageGuard(() =>
    resolveProjectForPage(session.user.id, slug, organizationId),
  );
  await runPageGuard(() =>
    requirePageAction("project.read", {
      userId: session.user.id,
      organizationId,
      projectId: projectRow.id,
    }),
  );
  return { session, project: projectRow };
}
