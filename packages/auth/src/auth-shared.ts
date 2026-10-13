import { orgAc, orgBetterAuthRoles } from "@env-manager/actions";
import { activeUserWhere, db } from "@env-manager/db";
import { assertOrganizationCanBeDeleted } from "@env-manager/db/org-delete-policy";
import * as authSchema from "@env-manager/db/schema/auth";
import { user } from "@env-manager/db/schema/auth";
import { deviceCode } from "@env-manager/db/schema/device-code";
import { jwks } from "@env-manager/db/schema/jwks";
import * as oauthSchema from "@env-manager/db/schema/oauth";
import * as organizationSchema from "@env-manager/db/schema/organization";
import * as teamSchema from "@env-manager/db/schema/team";
import { teamMember } from "@env-manager/db/schema/team";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import {
  isNotificationsEnabled,
  linkPendingNotificationsForUser,
} from "@env-manager/notifications";
import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { eq } from "drizzle-orm";
import { writeAuthAuditEvent } from "./audit-event";
import { resolveDefaultActiveOrganizationId } from "./bootstrap-active-organization";

const e2eTestMode = process.env.E2E_TEST_MODE === "1";

export function sharedDatabaseHooks(): BetterAuthOptions["databaseHooks"] {
  return {
    session: {
      create: {
        before: async (session) => {
          if (!isOrganizationsEnabled() || session.activeOrganizationId) {
            return;
          }
          const organizationId = await resolveDefaultActiveOrganizationId(
            session.userId,
          );
          if (!organizationId) {
            return;
          }
          return {
            data: {
              activeOrganizationId: organizationId,
            },
          };
        },
        after: async (session) => {
          void writeAuthAuditEvent({
            action: "session.sign_in",
            result: "success",
            actorUserId: session.userId,
            entityId: session.id,
            payload: { sessionId: session.id },
          });

          if (!isNotificationsEnabled()) {
            return;
          }
          void (async () => {
            const [record] = await db
              .select({ email: user.email })
              .from(user)
              .where(activeUserWhere(eq(user.id, session.userId)))
              .limit(1);
            if (record?.email) {
              await linkPendingNotificationsForUser(
                session.userId,
                record.email,
              );
            }
          })();
        },
      },
      delete: {
        after: async (session) => {
          await writeAuthAuditEvent({
            action: "session.sign_out",
            result: "success",
            actorUserId: session.userId,
            entityId: session.id,
            payload: { sessionId: session.id },
          });
        },
      },
    },
  };
}

export function sharedSessionConfig(): BetterAuthOptions["session"] {
  return {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  };
}

export function sharedDatabaseConfig(): BetterAuthOptions["database"] {
  return drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...authSchema,
      ...organizationSchema,
      ...teamSchema,
    },
  });
}

/** OAuth/MCP tables for `apps/auth` when `PLATFORM_AUTH_ENABLE_MCP=1`. */
export function platformDatabaseConfig(): BetterAuthOptions["database"] {
  const base = {
    ...authSchema,
    ...organizationSchema,
    ...teamSchema,
    jwks,
    deviceCode,
  };
  if (process.env.PLATFORM_AUTH_ENABLE_MCP !== "1") {
    return drizzleAdapter(db, { provider: "pg", schema: base });
  }
  return drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...base,
      ...oauthSchema,
    },
  });
}

export function organizationPlugin() {
  if (!isOrganizationsEnabled()) {
    return [];
  }
  return [
    organization({
      allowUserToCreateOrganization: true,
      ac: orgAc,
      roles: orgBetterAuthRoles,
      teams: { enabled: true },
      organizationHooks: {
        beforeDeleteOrganization: async ({ organization: org, user }) => {
          await assertOrganizationCanBeDeleted(org, user.id);
        },
        afterCreateOrganization: async ({ organization: org, user }) => {
          await writeAuthAuditEvent({
            action: "organization.create",
            result: "success",
            actorUserId: user.id,
            organizationId: org.id,
            entityId: org.id,
            entitySlug: org.slug,
            payload: { name: org.name },
          });
        },
        afterUpdateOrganization: async ({ organization: org, user }) => {
          if (!org) return;
          await writeAuthAuditEvent({
            action: "organization.update",
            result: "success",
            actorUserId: user.id,
            organizationId: org.id,
            entityId: org.id,
            entitySlug: org.slug,
          });
        },
        afterCreateInvitation: async ({ invitation: invite, inviter }) => {
          await writeAuthAuditEvent({
            action: "member.invite",
            result: "success",
            actorUserId: inviter.id,
            organizationId: invite.organizationId,
            entityId: invite.id,
            payload: {
              invitationId: invite.id,
              email: invite.email,
            },
          });
        },
        afterAcceptInvitation: async ({ invitation: invite, user }) => {
          await writeAuthAuditEvent({
            action: "invitation.accept",
            result: "success",
            actorUserId: user.id,
            organizationId: invite.organizationId,
            entityId: invite.id,
            payload: { invitationId: invite.id },
          });
        },
        afterCancelInvitation: async ({ invitation: invite, cancelledBy }) => {
          await writeAuthAuditEvent({
            action: "invitation.cancel",
            result: "success",
            actorUserId: cancelledBy.id,
            organizationId: invite.organizationId,
            entityId: invite.id,
            payload: { invitationId: invite.id },
          });
        },
        afterUpdateMemberRole: async ({
          member: memberRow,
          user,
          organization: org,
        }) => {
          if (!org) return;
          await writeAuthAuditEvent({
            action: "member.role.update",
            result: "success",
            actorUserId: user.id,
            organizationId: org.id,
            entityId: memberRow.id,
            targetUserId: memberRow.userId,
            payload: { role: memberRow.role },
          });
        },
        afterRemoveMember: async ({
          member: memberRow,
          user,
          organization: org,
        }) => {
          if (!org) return;
          await writeAuthAuditEvent({
            action: "member.remove",
            result: "success",
            actorUserId: user.id,
            organizationId: org.id,
            entityId: memberRow.id,
            targetUserId: memberRow.userId,
          });
        },
        afterCreateTeam: async ({ team, user }) => {
          if (!user?.id) return;
          await db.insert(teamMember).values({
            id: crypto.randomUUID(),
            teamId: team.id,
            userId: user.id,
          });
        },
      },
    }),
  ];
}

export function sharedE2eEmailPassword(): Pick<
  BetterAuthOptions,
  "emailAndPassword"
> {
  return e2eTestMode
    ? {
        emailAndPassword: {
          enabled: true,
        },
      }
    : {};
}

export function basePlugins() {
  return [
    nextCookies(),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    ...organizationPlugin(),
  ];
}
