import { env } from "@env-manager/env/server";
import { betterAuth } from "better-auth";
import {
  basePlugins,
  sharedDatabaseConfig,
  sharedDatabaseHooks,
  sharedE2eEmailPassword,
  sharedSessionConfig,
} from "./auth-shared";

/** Legacy `apps/web` auth — unchanged behavior until P3 cutover (#97). */
export const auth = betterAuth({
  databaseHooks: sharedDatabaseHooks(),
  session: sharedSessionConfig(),
  ...sharedE2eEmailPassword(),
  database: sharedDatabaseConfig(),
  trustedOrigins: [env.CORS_ORIGIN],
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  plugins: basePlugins(),
});
