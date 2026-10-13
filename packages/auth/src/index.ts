import { activeUserWhere, db } from "@env-manager/db";
import { assertOrganizationCanBeDeleted } from "@env-manager/db/org-delete-policy";
import * as authSchema from "@env-manager/db/schema/auth";
import { user } from "@env-manager/db/schema/auth";
import * as organizationSchema from "@env-manager/db/schema/organization";
import * as teamSchema from "@env-manager/db/schema/team";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import { env } from "@env-manager/env/server";
import {
  isNotificationsEnabled,
  linkPendingNotificationsForUser,
} from "@env-manager/notifications";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { orgAc, orgBetterAuthRoles } from "@env-manager/actions";
import { organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { writeAuthAuditEvent } from "./audit-event";

const e2eTestMode = process.env.E2E_TEST_MODE === "1";

export const auth = betterAuth({
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await writeAuthAuditEvent({
            action: "session.sign_in",
            result: "success",
            actorUserId: session.userId,
            entityId: session.id,
            payload: { sessionId: session.id },
          });

          if (!isNotificationsEnabled()) {
            return;
          }
          const [record] = await db
            .select({ email: user.email })
            .from(user)
            .where(activeUserWhere(eq(user.id, session.userId)))
            .limit(1);
          if (record?.email) {
            await linkPendingNotificationsForUser(session.userId, record.email);
          }
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
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  ...(e2eTestMode
    ? {
        emailAndPassword: {
          enabled: true,
        },
      }
    : {}),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...authSchema,
      ...organizationSchema,
      ...teamSchema,
    },
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    nextCookies(),
    ...(isOrganizationsEnabled()
      ? [
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
              afterUpdateOrganization: async ({
                organization: org,
                user,
              }) => {
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
              afterCancelInvitation: async ({
                invitation: invite,
                cancelledBy,
              }) => {
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
            },
          }),
        ]
      : []),
  ],
});
