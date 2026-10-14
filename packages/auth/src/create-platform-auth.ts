import { cimd } from "@better-auth/cimd";
import { fetchClientMetadataResource } from "@better-auth/cimd/node";
import { mcp } from "@better-auth/mcp";
import { MCP_OAUTH_SCOPES } from "@collidr/actions";
import { env } from "@collidr/env/server";
import { resolvePlatformPublicOrigin } from "@collidr/env/vercel-services";
import type { BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { deviceAuthorization, jwt, oneTimeToken } from "better-auth/plugins";
import {
  coreAuthPlugins,
  platformDatabaseConfig,
  withNextCookies,
  sharedAuthAdvanced,
  sharedDatabaseHooks,
  sharedE2eEmailPassword,
  sharedSessionConfig,
} from "./auth-shared";
import {
  DEFAULT_AUTH_URL,
  DEFAULT_MCP_URL,
  getPlatformProductionOrigins,
  trimTrailingSlash,
} from "./platform-urls";

function buildMcpPlugins(): BetterAuthPlugin[] {
  if (process.env.PLATFORM_AUTH_ENABLE_MCP !== "1") {
    return [];
  }
  const mcpHost = trimTrailingSlash(
    process.env.MCP_RESOURCE_URL ??
      process.env.NEXT_PUBLIC_MCP_URL ??
      (process.env.VERCEL_SERVICES === "1"
        ? `${resolvePlatformPublicOrigin()}/api/mcp`
        : `${DEFAULT_MCP_URL.replace(/\/$/, "")}/api/mcp`),
  );
  const mcpResource = mcpHost.endsWith("/api/mcp")
    ? mcpHost
    : `${mcpHost}/api/mcp`;

  return [
    mcp({
      loginPage: "/sign-in",
      consentPage: "/consent",
      resource: mcpResource,
      scopes: [...MCP_OAUTH_SCOPES],
      allowDynamicClientRegistration: true,
    }) as BetterAuthPlugin,
    cimd({
      fetchClientMetadataResource,
      metadataProfile: "mcp-2026-07-28",
    }) as BetterAuthPlugin,
  ];
}

/**
 * Better Auth instance for `apps/auth` only — OAuth issuer, MCP, device flow (P2).
 * Import only from the auth app route handler.
 */
export function createPlatformAuth() {
  const baseURL = trimTrailingSlash(
    env.BETTER_AUTH_URL ??
      (process.env.VERCEL_SERVICES === "1"
        ? `${resolvePlatformPublicOrigin()}/auth`
        : DEFAULT_AUTH_URL),
  );
  const trustedOrigins = getPlatformProductionOrigins({
    authUrl: baseURL,
    legacyWebUrl: env.CORS_ORIGIN,
  });

  return betterAuth({
    baseURL,
    secret:
      env.BETTER_AUTH_SECRET ?? "local-build-placeholder-secret-min-32-chars",
    advanced: sharedAuthAdvanced(),
    databaseHooks: sharedDatabaseHooks(),
    session: sharedSessionConfig(),
    ...sharedE2eEmailPassword(),
    database: platformDatabaseConfig(),
    trustedOrigins,
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID ?? "build-placeholder",
        clientSecret: env.GITHUB_CLIENT_SECRET ?? "build-placeholder",
      },
    },
    plugins: withNextCookies([
      ...coreAuthPlugins(),
      jwt(),
      oneTimeToken({
        expiresIn: 5,
      }),
      deviceAuthorization({
        verificationUri: "/device",
      }),
      ...buildMcpPlugins(),
    ]) as BetterAuthPlugin[],
  });
}
