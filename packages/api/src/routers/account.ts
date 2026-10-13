import { isActionsAuditEnabled } from "@env-manager/actions";
import { db } from "@env-manager/db";
import { auditLog } from "@env-manager/db/schema/audit";
import { auditEvent } from "@env-manager/db/schema/audit-event";
import { account, session, user } from "@env-manager/db/schema/auth";
import { notification } from "@env-manager/db/schema/notifications";
import { member, organization } from "@env-manager/db/schema/organization";
import {
  environment,
  environmentVariable,
  project,
} from "@env-manager/db/schema/projects";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { requireAction } from "../actions/require-action";
import { protectedProcedure, router } from "../index";
import {
  accountConnectedOutput,
  accountDeleteBlockerOutput,
  makeResponseSchema,
  respond,
} from "../validation";

async function findSoleOwnerOrganizations(userId: string) {
  if (!isOrganizationsEnabled()) {
    return [];
  }

  const owned = await db
    .select({
      organizationId: member.organizationId,
      orgName: organization.name,
      orgSlug: organization.slug,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(and(eq(member.userId, userId), eq(member.role, "owner")));

  const blockers: { organizationId: string; name: string; slug: string }[] = [];

  for (const row of owned) {
    const owners = await db
      .select({ id: member.id })
      .from(member)
      .where(
        and(
          eq(member.organizationId, row.organizationId),
          eq(member.role, "owner"),
        ),
      );
    if (owners.length === 1) {
      blockers.push({
        organizationId: row.organizationId,
        name: row.orgName,
        slug: row.orgSlug,
      });
    }
  }

  return blockers;
}

export const accountRouter = router({
  listConnectedAccounts: protectedProcedure
    .use(actionGuard("account.list"))
    .output(makeResponseSchema(z.array(accountConnectedOutput)))
    .query(async ({ ctx }) => {
      const rows = await db
        .select({
          id: account.id,
          providerId: account.providerId,
          accountId: account.accountId,
          scope: account.scope,
          createdAt: account.createdAt,
        })
        .from(account)
        .where(eq(account.userId, ctx.session.user.id))
        .orderBy(desc(account.createdAt));

      return respond({
        message: "Connected accounts fetched",
        data: rows.map((row) => ({
          id: row.id,
          providerId: row.providerId,
          accountId: row.accountId,
          scope: row.scope,
          createdAt:
            row.createdAt instanceof Date
              ? row.createdAt.toISOString()
              : String(row.createdAt),
        })),
      });
    }),

  getDeleteBlockers: protectedProcedure
    .use(actionGuard("account.delete"))
    .output(makeResponseSchema(accountDeleteBlockerOutput))
    .query(async ({ ctx }) => {
      const soleOwnerOrgs = await findSoleOwnerOrganizations(
        ctx.session.user.id,
      );
      return respond({
        message: "Delete blockers fetched",
        data: {
          soleOwnerOrganizations: soleOwnerOrgs,
          canDelete: soleOwnerOrgs.length === 0,
        },
      });
    }),

  exportData: protectedProcedure
    .use(actionGuard("account.export"))
    .mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [
      profileRow,
      accounts,
      projectsOwned,
      memberships,
      notifications,
      auditRows,
      sessionRows,
    ] = await Promise.all([
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1),
      db
        .select({
          providerId: account.providerId,
          accountId: account.accountId,
          scope: account.scope,
          createdAt: account.createdAt,
        })
        .from(account)
        .where(eq(account.userId, userId)),
      db.select().from(project).where(eq(project.userId, userId)),
      db.select().from(member).where(eq(member.userId, userId)),
      db
        .select()
        .from(notification)
        .where(eq(notification.recipientUserId, userId)),
      db
        .select({
          id: auditLog.id,
          action: auditLog.action,
          entityType: auditLog.entityType,
          entitySlug: auditLog.entitySlug,
          projectId: auditLog.projectId,
          environmentId: auditLog.environmentId,
          createdAt: auditLog.createdAt,
        })
        .from(auditLog)
        .where(eq(auditLog.userId, userId))
        .orderBy(desc(auditLog.createdAt))
        .limit(500),
      db
        .select({
          id: session.id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
        })
        .from(session)
        .where(eq(session.userId, userId)),
    ]);

    let auditEvents: unknown[] = [];
    if (isActionsAuditEnabled()) {
      try {
        auditEvents = await db
          .select()
          .from(auditEvent)
          .where(eq(auditEvent.actorUserId, userId))
          .limit(1000);
      } catch {
        auditEvents = [];
      }
    }

    const projectIds = projectsOwned.map((p) => p.id);
    const environments =
      projectIds.length > 0
        ? await db
            .select({
              id: environment.id,
              name: environment.name,
              slug: environment.slug,
              status: environment.status,
              isProduction: environment.isProduction,
              projectId: environment.projectId,
              createdAt: environment.createdAt,
              updatedAt: environment.updatedAt,
            })
            .from(environment)
            .where(inArray(environment.projectId, projectIds))
        : [];

    const environmentIds = environments.map((e) => e.id);
    const variables =
      environmentIds.length > 0
        ? await db
            .select({
              id: environmentVariable.id,
              key: environmentVariable.key,
              environmentId: environmentVariable.environmentId,
              createdAt: environmentVariable.createdAt,
              updatedAt: environmentVariable.updatedAt,
            })
            .from(environmentVariable)
            .where(inArray(environmentVariable.environmentId, environmentIds))
        : [];

    const profile = profileRow[0];

    return {
      exportedAt: new Date().toISOString(),
      note: "Variable values are omitted from exports; only keys and metadata are included.",
      profile,
      connectedAccounts: accounts,
      sessions: sessionRows,
      memberships,
      projects: projectsOwned,
      environments,
      variables,
      notifications,
      auditLog: auditRows,
      auditEvents,
    };
  }),

  softDelete: protectedProcedure
    .use(actionGuard("account.delete"))
    .output(makeResponseSchema(z.object({ success: z.literal(true) })))
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      if (isActionsAuditEnabled()) {
        await requireAction("account.delete", { userId });
      }

      const blockers = await findSoleOwnerOrganizations(userId);
      if (blockers.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Transfer organization ownership before deleting your account.",
        });
      }

      const anonymizedEmail = `deleted-${userId}@users.deleted.local`;

      await db
        .update(user)
        .set({
          name: "Deleted user",
          email: anonymizedEmail,
          image: null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      try {
        await db.execute(sql`
          UPDATE "user"
          SET deleted_at = NOW(), deleted_by = ${userId}
          WHERE id = ${userId}
        `);
      } catch {
        // Column may not exist until permissions migration lands.
      }

      await db.delete(session).where(eq(session.userId, userId));

      return respond({
        message: "Account deleted",
        data: { success: true },
      });
    }),
});
