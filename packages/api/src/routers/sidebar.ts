import {
  activeEnvironmentWhere,
  activeMemberWhere,
  activeProjectWhere,
  db,
} from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { notification } from "@loftlancer/db/schema/notifications";
import {
  invitation,
  member,
  organization,
} from "@loftlancer/db/schema/organization";
import { projectPin } from "@loftlancer/db/schema/project-pin";
import { environment, project } from "@loftlancer/db/schema/projects";
import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import { TRPCError } from "@trpc/server";
import { and, asc, count, eq, gt, inArray, isNull } from "drizzle-orm";
import { z } from "zod/v3";
import { listInstalledAppIds } from "../apps/installed";
import { protectedProcedure, router } from "../index";
import { getActiveOrganizationId, projectListFilter } from "../org-access";
import { listAccessibleProjectIds, projectIdsFilter } from "../project-list";

/** project_pin may not exist yet on a database that hasn't had 0014 applied. */
function isMissingTable(err: unknown) {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "42P01" || e?.cause?.code === "42P01";
}

async function accessibleProjects(
  userId: string,
  organizationId: string | null,
) {
  const ids = await listAccessibleProjectIds(userId, organizationId);
  const idFilter = projectIdsFilter(ids);
  const where =
    idFilter && organizationId
      ? and(eq(project.organizationId, organizationId), idFilter)
      : projectListFilter(userId, organizationId);
  return db
    .select({ id: project.id, name: project.name, slug: project.slug })
    .from(project)
    .where(activeProjectWhere(and(where, eq(project.isArchived, false))))
    .orderBy(asc(project.name));
}

/**
 * One read for the shared sidebar: projects (+ environments) for ⌘K and
 * Favorites, the user's pins, nav counts and org members. Real data only.
 * Reads never write audit events.
 */
export const sidebarRouter = router({
  navigator: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const email = ctx.session.user.email;
    const organizationId = isOrganizationsEnabled()
      ? getActiveOrganizationId(ctx.session)
      : null;

    const [projects, unread, invites, members, pins] = await Promise.all([
      accessibleProjects(userId, organizationId).catch(() => []),
      db
        .select({ n: count() })
        .from(notification)
        .where(
          and(
            eq(notification.recipientUserId, userId),
            isNull(notification.readAt),
          ),
        )
        .then((r) => Number(r[0]?.n ?? 0))
        .catch(() => 0),
      email
        ? db
            .select({ n: count() })
            .from(invitation)
            .where(
              and(
                eq(invitation.email, email),
                eq(invitation.status, "pending"),
                gt(invitation.expiresAt, new Date()),
              ),
            )
            .then((r) => Number(r[0]?.n ?? 0))
            .catch(() => 0)
        : Promise.resolve(0),
      organizationId
        ? db
            .select({ userId: user.id, name: user.name, email: user.email })
            .from(member)
            .innerJoin(user, eq(member.userId, user.id))
            .where(activeMemberWhere(eq(member.organizationId, organizationId)))
            .orderBy(asc(user.name))
            .limit(200)
            .catch(() => [])
        : Promise.resolve([]),
      db
        .select({ projectId: projectPin.projectId })
        .from(projectPin)
        .where(eq(projectPin.userId, userId))
        .orderBy(asc(projectPin.createdAt))
        .then((r) => r.map((x) => x.projectId))
        .catch((err) => {
          if (!isMissingTable(err)) console.error("[sidebar] pins", err);
          return [] as string[];
        }),
    ]);

    const orgRow = organizationId
      ? await db
          .select({ slug: organization.slug })
          .from(organization)
          .where(eq(organization.id, organizationId))
          .limit(1)
          .catch(() => [])
      : [];
    const projectIds = projects.map((p) => p.id);
    const envs = projectIds.length
      ? await db
          .select({
            projectId: environment.projectId,
            name: environment.name,
            slug: environment.slug,
            isProduction: environment.isProduction,
          })
          .from(environment)
          .where(
            activeEnvironmentWhere(inArray(environment.projectId, projectIds)),
          )
          .orderBy(asc(environment.name))
          .catch(() => [])
      : [];

    const installed = await listInstalledAppIds(projectIds).catch(
      () => new Map<string, string[]>(),
    );

    return {
      organizationId,
      organizationSlug: orgRow[0]?.slug ?? null,
      projects: projects.map((p) => ({
        ...p,
        apps: installed.get(p.id) ?? [],
        environments: envs
          .filter((e) => e.projectId === p.id)
          .map(({ projectId: _p, ...e }) => e),
      })),
      pins: pins.filter((id) => projectIds.includes(id)),
      members,
      counts: {
        unreadNotifications: unread,
        pendingInvites: invites,
        projects: projects.length,
      },
    };
  }),

  pin: protectedProcedure
    .input(z.object({ projectId: z.string().min(1), pinned: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const organizationId = isOrganizationsEnabled()
        ? getActiveOrganizationId(ctx.session)
        : null;
      try {
        if (input.pinned) {
          const allowed = await accessibleProjects(userId, organizationId);
          if (!allowed.some((p) => p.id === input.projectId)) {
            return { ok: false as const };
          }
          await db
            .insert(projectPin)
            .values({ userId, projectId: input.projectId })
            .onConflictDoNothing();
        } else {
          await db
            .delete(projectPin)
            .where(
              and(
                eq(projectPin.userId, userId),
                eq(projectPin.projectId, input.projectId),
              ),
            );
        }
      } catch (err) {
        if (isMissingTable(err)) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message:
              "Favorites are not available yet (database migration 0014 pending).",
          });
        }
        throw err;
      }
      return { ok: true as const };
    }),
});
