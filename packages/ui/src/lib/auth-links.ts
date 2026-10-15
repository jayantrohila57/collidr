import { resolvePublicServiceUrl } from "@loftlancer/env/vercel-services";

const DEFAULT_AUTH_URL = "https://auth.loftlancer.com";
const DEFAULT_STUDIO_URL = "https://studio.loftlancer.com";
const DEFAULT_CONSOLE_URL = "https://console.loftlancer.com";
const DEFAULT_SUPPORT_URL =
  "https://studio.loftlancer.com/dashboard/support/tickets";

function authUrlDefault(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("auth")
    : DEFAULT_AUTH_URL;
}

function studioUrlDefault(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("studio")
    : DEFAULT_STUDIO_URL;
}

function consoleUrlDefault(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("console")
    : DEFAULT_CONSOLE_URL;
}

export type PlatformUrlEnv = {
  authUrl?: string;
  studioUrl?: string;
  consoleUrl?: string;
  supportUrl?: string;
};

export function defaultSupportReturnTo(env: PlatformUrlEnv = {}): string {
  const supportOrigin = trimTrailingSlash(
    env.supportUrl ??
      process.env.NEXT_PUBLIC_SUPPORT_URL ??
      DEFAULT_SUPPORT_URL,
  );
  return supportOrigin.includes("/dashboard/support")
    ? supportOrigin
    : `${supportOrigin}/dashboard/support/tickets`;
}

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Absolute studio dashboard URL used as default `return_to` after sign-in. */
export function defaultStudioReturnTo(env: PlatformUrlEnv = {}): string {
  const studio = trimTrailingSlash(
    env.studioUrl ?? process.env.NEXT_PUBLIC_STUDIO_URL ?? studioUrlDefault(),
  );
  return `${studio}/dashboard`;
}

/**
 * Auth app sign-in URL with allowlisted `return_to` (Decision 4, PLAN §5).
 * Until `apps/auth` ships, the same path works on the legacy web host.
 */
export function defaultConsoleReturnTo(env: PlatformUrlEnv = {}): string {
  const consoleOrigin = trimTrailingSlash(
    env.consoleUrl ??
      process.env.NEXT_PUBLIC_CONSOLE_URL ??
      consoleUrlDefault(),
  );
  return `${consoleOrigin}/dashboard`;
}

export function buildSignInUrl(
  options: PlatformUrlEnv & { returnTo?: string } = {},
): string {
  const auth = trimTrailingSlash(
    options.authUrl ?? process.env.NEXT_PUBLIC_AUTH_URL ?? authUrlDefault(),
  );
  const returnTo = options.returnTo ?? defaultStudioReturnTo(options);
  const params = new URLSearchParams({ return_to: returnTo });
  return `${auth}/sign-in?${params.toString()}`;
}

/** Auth app sign-out with allowlisted `return_to` (revokes shared session). */
export function buildSignOutUrl(
  options: PlatformUrlEnv & { returnTo?: string } = {},
): string {
  const auth = trimTrailingSlash(
    options.authUrl ?? process.env.NEXT_PUBLIC_AUTH_URL ?? authUrlDefault(),
  );
  const returnTo = options.returnTo ?? buildSignInUrl(options);
  const params = new URLSearchParams({ return_to: returnTo });
  return `${auth}/sign-out?${params.toString()}`;
}

export function resolveAuthAppOrigin(env: PlatformUrlEnv = {}): string {
  return trimTrailingSlash(
    env.authUrl ?? process.env.NEXT_PUBLIC_AUTH_URL ?? authUrlDefault(),
  );
}

/** Post sign-out landing: sign-in for this app with dashboard as return target. */
export function defaultAppSignInAfterSignOut(
  appOrigin: string,
  env: PlatformUrlEnv = {},
): string {
  const origin = trimTrailingSlash(appOrigin);
  const returnTo = `${origin}/dashboard`;
  return buildSignInUrl({ ...env, returnTo });
}
