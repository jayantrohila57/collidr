import { db } from "@env-manager/db";
import * as authSchema from "@env-manager/db/schema/auth";
import * as organizationSchema from "@env-manager/db/schema/organization";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import { env } from "@env-manager/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
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
          }),
        ]
      : []),
  ],
});
