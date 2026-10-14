import { env } from "@collidr/env/server";
import { betterAuth } from "better-auth";
import { oneTimeToken } from "better-auth/plugins";
import {
  coreAuthPlugins,
  sharedAuthAdvanced,
  withNextCookies,
  sharedDatabaseConfig,
  sharedDatabaseHooks,
  sharedE2eEmailPassword,
  sharedSessionConfig,
} from "./auth-shared";
import {
  DEFAULT_AUTH_URL,
  getPlatformProductionOrigins,
} from "./platform-urls";

export type CreateSiblingAuthOptions = {
  /** Public origin of this app (`BETTER_AUTH_URL` for studio/account). */
  baseURL: string;
};

/**
 * Session + org plugin instance for studio/account — no social login (auth app only).
 * Mount at `/api/auth/*` on sibling apps for per-origin cookies + OTT verify.
 */
export function createSiblingAuth(options: CreateSiblingAuthOptions) {
  const trustedOrigins = getPlatformProductionOrigins({
    legacyWebUrl: env.CORS_ORIGIN,
  });

  return betterAuth({
    baseURL: options.baseURL || env.BETTER_AUTH_URL || DEFAULT_AUTH_URL,
    secret:
      env.BETTER_AUTH_SECRET ?? "local-build-placeholder-secret-min-32-chars",
    advanced: sharedAuthAdvanced(),
    databaseHooks: sharedDatabaseHooks(),
    session: sharedSessionConfig(),
    ...sharedE2eEmailPassword(),
    database: sharedDatabaseConfig(),
    trustedOrigins,
    plugins: withNextCookies([
      ...coreAuthPlugins(),
      oneTimeToken({
        expiresIn: 5,
      }),
    ]),
  });
}
