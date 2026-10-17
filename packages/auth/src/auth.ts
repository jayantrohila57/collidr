import { env } from "@loftlancer/env/server";
import { betterAuth } from "better-auth";
import {
  coreAuthPlugins,
  sharedAuthAdvanced,
  sharedDatabaseConfig,
  sharedDatabaseHooks,
  sharedSessionConfig,
  withNextCookies,
} from "./auth-shared";
import {
  e2eMagicLinkPlugins,
  passwordDisabled,
  socialProviders,
} from "./passwordless";

/** Legacy `apps/web` auth — unchanged behavior until P3 cutover (#97). */
export const auth = betterAuth({
  advanced: sharedAuthAdvanced(),
  databaseHooks: sharedDatabaseHooks(),
  session: sharedSessionConfig(),
  ...passwordDisabled,
  database: sharedDatabaseConfig(),
  trustedOrigins: [env.CORS_ORIGIN],
  socialProviders: socialProviders(),
  plugins: withNextCookies([...coreAuthPlugins(), ...e2eMagicLinkPlugins()]),
});
