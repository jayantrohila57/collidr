import "server-only";

import type { ActionName } from "@loftlancer/actions";
import {
  organizationChildAction,
  requirePageAction,
  resolveOrganizationForPage,
  resolveProjectForPage,
  runPageGuard,
} from "@loftlancer/api/page-guards";
import type { RequirePageSessionResult } from "@loftlancer/auth/guards";
import { requirePageSession } from "@loftlancer/auth/guards";
import {
  type AuthSession,
  getSessionActiveOrganizationId,
} from "@loftlancer/auth/session-types";
import { DEFAULT_STUDIO_URL } from "@loftlancer/env/platform";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getServerSession } from "@/lib/server-auth";

const appOrigin = (
  process.env.NEXT_PUBLIC_STUDIO_URL ?? DEFAULT_STUDIO_URL
).replace(/\/$/, "");

async function currentReturnPath(): Promise<string> {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");
  if (pathname?.startsWith("/")) {
    return pathname;
  }
  const nextUrl = headerList.get("x-url");
  if (nextUrl) {
    try {
      return new URL(nextUrl).pathname;
    } catch {
      /* ignore */
    }
  }
  return "/";
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

/** Cached per request: the [slug] layout and its page both call this. */
export const guardOrganizationSlugMembership = cache(async (slug: string) => {
  const session = await guardAuthenticatedPage();
  const org = await runPageGuard(() =>
    resolveOrganizationForPage(session.user.id, slug),
  );
  return { session, org };
});

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

export async function loadProjectPageDataOrNotFound(
  slug: string,
): Promise<import("@/lib/project-page-loader").ProjectPageData> {
  await guardProjectSlugPage(slug);
  const { loadProjectPageData } = await import("@/lib/project-page-loader");
  const data = await loadProjectPageData(slug);
  if (!data) {
    const { notFound } = await import("next/navigation");
    return notFound();
  }
  return data;
}

export async function guardProjectEditPage(slug: string) {
  const { session, project } = await guardProjectSlugPage(slug);
  await runPageGuard(() =>
    requirePageAction("project.update", {
      userId: session.user.id,
      organizationId: getSessionActiveOrganizationId(session),
      projectId: project.id,
    }),
  );
  return project;
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

export async function guardSupportManagerPage(): Promise<AuthSession> {
  const session = await guardAuthenticatedPage();
  const { requireSupportManagerPage } = await import(
    "@loftlancer/api/page-guards"
  );
  await runPageGuard(() => requireSupportManagerPage(session.user.id));
  return session;
}

export async function guardSupportTicketPage(
  ticketId: string,
): Promise<AuthSession> {
  const session = await guardAuthenticatedPage();
  const { requireSupportTicketPage } = await import(
    "@loftlancer/api/page-guards"
  );
  await runPageGuard(() => requireSupportTicketPage(session.user.id, ticketId));
  return session;
}
