/** Production phase-1 hostnames (PLAN §2.0). */
export const DEFAULT_AUTH_URL = "https://auth-env-manager.vercel.app";
export const DEFAULT_STUDIO_URL = "https://studio-env-manager.vercel.app";
export const DEFAULT_ACCOUNT_URL = "https://account-env-manager.vercel.app";
export const DEFAULT_WWW_URL = "https://www-env-manager.vercel.app";
export const DEFAULT_MCP_URL = "https://mcp-env-manager.vercel.app";

export function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Origins allowed for `return_to` and Better Auth `trustedOrigins` (production only). */
export function getPlatformProductionOrigins(env: {
  authUrl?: string;
  studioUrl?: string;
  accountUrl?: string;
  wwwUrl?: string;
  mcpUrl?: string;
  legacyWebUrl?: string;
} = {}): string[] {
  const origins = [
    env.authUrl ?? process.env.BETTER_AUTH_URL ?? DEFAULT_AUTH_URL,
    env.studioUrl ?? process.env.NEXT_PUBLIC_STUDIO_URL ?? DEFAULT_STUDIO_URL,
    env.accountUrl ??
      process.env.NEXT_PUBLIC_ACCOUNT_URL ??
      DEFAULT_ACCOUNT_URL,
    env.wwwUrl ?? process.env.NEXT_PUBLIC_WWW_URL ?? DEFAULT_WWW_URL,
    env.mcpUrl ?? process.env.NEXT_PUBLIC_MCP_URL ?? DEFAULT_MCP_URL,
    env.legacyWebUrl ?? process.env.CORS_ORIGIN,
  ].filter(Boolean) as string[];

  return [...new Set(origins.map((o) => trimTrailingSlash(o)))];
}
