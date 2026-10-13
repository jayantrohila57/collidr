import { db } from "@env-manager/db";
import { assertOrganizationCanBeDeleted } from "@env-manager/db/org-delete-policy";
import * as authSchema from "@env-manager/db/schema/auth";
import * as organizationSchema from "@env-manager/db/schema/organization";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import { env } from "@env-manager/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";

const e2eTestMode = process.env.E2E_TEST_MODE === "1";

export const auth = betterAuth({
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
            organizationHooks: {
              beforeDeleteOrganization: async ({ organization: org, user }) => {
                await assertOrganizationCanBeDeleted(org, user.id);
              },
            },
          }),
        ]
      : []),
  ],
});
