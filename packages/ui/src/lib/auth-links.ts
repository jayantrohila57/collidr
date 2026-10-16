import { resolvePublicServiceUrl } from "@loftlancer/env/vercel-services";

const DEFAULT_AUTH_URL = "https://loftlancer.com/auth";
const DEFAULT_STUDIO_URL = "https://loftlancer.com/studio";
const DEFAULT_CONSOLE_URL = "https://loftlancer.com/studio";
const DEFAULT_SUPPORT_URL = "https://loftlancer.com/studio/support/tickets";

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
  return supportOrigin.includes("/support/tickets")
    ? supportOrigin
    : `${supportOrigin}/support/tickets`;
}

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Absolute studio home (org list): where every sign-in lands (#302). */
export function studioHomeUrl(env: PlatformUrlEnv = {}): string {
  return trimTrailingSlash(
    env.studioUrl ?? process.env.NEXT_PUBLIC_STUDIO_URL ?? studioUrlDefault(),
  );
}

/** Public landing (site root, docs app). Signed-out studio visits land here. */
export function landingUrl(env: PlatformUrlEnv = {}): string {
  const docs = process.env.NEXT_PUBLIC_DOCS_URL?.trim();
  if (docs && !env.studioUrl) return `${trimTrailingSlash(docs)}/`;
  return new URL("/", `${studioHomeUrl(env)}/`).toString();
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
  return consoleOrigin;
}

/**
 * Start GitHub sign-in directly (no sign-in screen, #302). A plain link: the
 * auth app route starts the OAuth flow and GitHub returns to /studio.
 * `returnTo` is ignored (no deep-link return by design).
 */
export function buildSignInUrl(
  options: PlatformUrlEnv & { returnTo?: string } = {},
): string {
  const auth = trimTrailingSlash(
    options.authUrl ?? process.env.NEXT_PUBLIC_AUTH_URL ?? authUrlDefault(),
  );
  return `${auth}/api/sign-in/github`;
}

export function resolveAuthAppOrigin(env: PlatformUrlEnv = {}): string {
  return trimTrailingSlash(
    env.authUrl ?? process.env.NEXT_PUBLIC_AUTH_URL ?? authUrlDefault(),
  );
}

/** Post sign-out landing: the public site root. */
export function defaultAppSignInAfterSignOut(
  _appOrigin: string,
  env: PlatformUrlEnv = {},
): string {
  return landingUrl(env);
}
