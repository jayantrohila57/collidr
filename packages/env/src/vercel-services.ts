function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Path prefix for each app when deployed via root `vercel.json` Services. */
export const SERVICE_BASE_PATHS = {
  www: "",
  web: "/app",
  docs: "/docs",
  auth: "/auth",
  account: "/account",
  console: "/console",
  support: "/support",
  studio: "/studio",
  mcp: "",
} as const;

export type VercelServiceName = keyof typeof SERVICE_BASE_PATHS;

const SERVICE_ENV_SUFFIX: Record<VercelServiceName, string> = {
  www: "WWW",
  web: "WEB",
  docs: "DOCS",
  auth: "AUTH",
  account: "ACCOUNT",
  console: "CONSOLE",
  support: "SUPPORT",
  studio: "STUDIO",
  mcp: "MCP",
};

/** Next.js `basePath` for a service (empty in local multi-port dev). */
export function readServiceBasePath(service: VercelServiceName): string {
  const suffix = SERVICE_ENV_SUFFIX[service];
  const override =
    process.env[`NEXT_BASE_PATH_${suffix}`] ?? process.env.NEXT_BASE_PATH;
  if (override !== undefined && override !== "") {
    return normalizeBasePath(override);
  }
  if (process.env.VERCEL_SERVICES === "1") {
    return SERVICE_BASE_PATHS[service];
  }
  return "";
}

function normalizeBasePath(path: string): string {
  if (!path || path === "/") {
    return "";
  }
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  return withLeading.replace(/\/$/, "");
}

/** Public deployment origin (no trailing slash). */
export function resolvePlatformPublicOrigin(): string {
  const explicit =
    process.env.PLATFORM_PUBLIC_ORIGIN ??
    process.env.NEXT_PUBLIC_PLATFORM_ORIGIN;
  if (explicit?.trim()) {
    return trimTrailingSlash(explicit.trim());
  }
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production?.trim()) {
    const host = production.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  const preview = process.env.VERCEL_URL;
  if (preview?.trim()) {
    const host = preview.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  return "https://collidr.vercel.app";
}

/** Browser-facing URL for a service (includes base path, no trailing slash). */
export function resolvePublicServiceUrl(service: VercelServiceName): string {
  const envKey = `NEXT_PUBLIC_${SERVICE_ENV_SUFFIX[service]}_URL`;
  const fromEnv = process.env[envKey];
  if (fromEnv?.trim()) {
    return trimTrailingSlash(fromEnv.trim());
  }
  const origin = resolvePlatformPublicOrigin();
  const base = readServiceBasePath(service);
  return base ? `${origin}${base}` : origin;
}

/**
 * Server-side URL for the auth service (service binding at runtime on Vercel).
 * Falls back to public auth URL when bindings are unavailable (local dev, build).
 */
export function resolveAuthServiceUrl(): string {
  const bound = process.env.AUTH_SERVICE_URL?.trim();
  if (bound) {
    return trimTrailingSlash(bound);
  }
  return resolvePublicServiceUrl("auth");
}

/** Join a path onto a service public URL. */
export function publicServicePath(
  service: VercelServiceName,
  pathname: string,
): string {
  const base = resolvePublicServiceUrl(service);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
