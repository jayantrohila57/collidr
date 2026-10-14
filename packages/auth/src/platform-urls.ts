import {
  resolvePlatformPublicOrigin,
  resolvePublicServiceUrl,
} from "@collidr/env/vercel-services";

/** Production phase-1 hostnames (PLAN §2.0); overridden when `VERCEL_SERVICES=1`. */
export const DEFAULT_AUTH_URL = "https://collidr.vercel.app/auth";
export const DEFAULT_STUDIO_URL = "https://collidr.vercel.app/studio";
export const DEFAULT_ACCOUNT_URL = "https://collidr.vercel.app/account";
export const DEFAULT_WWW_URL = "https://collidr.vercel.app";
export const DEFAULT_MCP_URL = "https://collidr.vercel.app";
export const DEFAULT_CONSOLE_URL = "https://collidr.vercel.app/console";
export const DEFAULT_SUPPORT_URL = "https://collidr.vercel.app/support";
export const DEFAULT_DOCS_URL = "https://collidr.vercel.app/docs";

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

function toTrustedOrigin(url: string): string {
  try {
    return new URL(trimTrailingSlash(url)).origin;
  } catch {
    return trimTrailingSlash(url);
  }
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
      ? [resolvePublicServiceUrl("studio")]
      : []),
  ].filter(Boolean) as string[];

  return [...new Set(origins.map((o) => toTrustedOrigin(o)))];
}
