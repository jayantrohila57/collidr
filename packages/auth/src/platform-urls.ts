import {
  resolvePlatformPublicOrigin,
  resolvePublicServiceUrl,
} from "@env-manager/env/vercel-services";

/** Production phase-1 hostnames (PLAN §2.0); overridden when `VERCEL_SERVICES=1`. */
export const DEFAULT_AUTH_URL = "https://auth-env-manager.vercel.app";
export const DEFAULT_STUDIO_URL = "https://studio-env-manager.vercel.app";
export const DEFAULT_ACCOUNT_URL = "https://account-env-manager.vercel.app";
export const DEFAULT_WWW_URL = "https://www-env-manager.vercel.app";
export const DEFAULT_MCP_URL = "https://mcp-env-manager.vercel.app";
export const DEFAULT_CONSOLE_URL = "https://console-env-manager.vercel.app";
export const DEFAULT_SUPPORT_URL = "https://support-env-manager.vercel.app";
export const DEFAULT_DOCS_URL = "https://docs-env-manager.vercel.app";

function defaultAuthUrl(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("auth")
    : DEFAULT_AUTH_URL;
}

function defaultStudioUrl(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("studio")
    : DEFAULT_STUDIO_URL;
}

function defaultAccountUrl(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("account")
    : DEFAULT_ACCOUNT_URL;
}

function defaultWwwUrl(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("www")
    : DEFAULT_WWW_URL;
}

function defaultMcpPublicUrl(): string {
  if (process.env.VERCEL_SERVICES === "1") {
    const origin = resolvePlatformPublicOrigin();
    return `${origin}/api/mcp`;
  }
  return DEFAULT_MCP_URL;
}

export function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Origins allowed for `return_to` and Better Auth `trustedOrigins` (production only). */
export function getPlatformProductionOrigins(
  env: {
    authUrl?: string;
    studioUrl?: string;
    accountUrl?: string;
    wwwUrl?: string;
    mcpUrl?: string;
    supportUrl?: string;
    consoleUrl?: string;
    legacyWebUrl?: string;
  } = {},
): string[] {
  if (
    process.env.PLATFORM_PUBLIC_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_PLATFORM_ORIGIN?.trim() ||
    process.env.VERCEL_SERVICES === "1"
  ) {
    const single = resolvePlatformPublicOrigin();
    return [trimTrailingSlash(single)];
  }

  const origins = [
    env.authUrl ?? process.env.BETTER_AUTH_URL ?? defaultAuthUrl(),
    env.studioUrl ?? process.env.NEXT_PUBLIC_STUDIO_URL ?? defaultStudioUrl(),
    env.accountUrl ??
      process.env.NEXT_PUBLIC_ACCOUNT_URL ??
      defaultAccountUrl(),
    env.consoleUrl ??
      process.env.NEXT_PUBLIC_CONSOLE_URL ??
      DEFAULT_CONSOLE_URL,
    env.supportUrl ??
      process.env.NEXT_PUBLIC_SUPPORT_URL ??
      DEFAULT_SUPPORT_URL,
    env.wwwUrl ?? process.env.NEXT_PUBLIC_WWW_URL ?? defaultWwwUrl(),
    env.mcpUrl ?? process.env.NEXT_PUBLIC_MCP_URL ?? defaultMcpPublicUrl(),
    env.legacyWebUrl ?? process.env.CORS_ORIGIN,
    process.env.NEXT_PUBLIC_DOCS_URL ?? DEFAULT_DOCS_URL,
    ...(process.env.VERCEL_SERVICES === "1"
      ? [resolvePublicServiceUrl("web")]
      : []),
  ].filter(Boolean) as string[];

  return [
    ...new Set(
      origins
        .filter((o): o is string => typeof o === "string" && o.length > 0)
        .map((o) => trimTrailingSlash(o)),
    ),
  ];
}
