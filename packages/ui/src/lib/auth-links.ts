const DEFAULT_AUTH_URL = "https://auth-env-manager.vercel.app";
const DEFAULT_STUDIO_URL = "https://studio-env-manager.vercel.app";

export type PlatformUrlEnv = {
  authUrl?: string;
  studioUrl?: string;
};

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Absolute studio dashboard URL used as default `return_to` after sign-in. */
export function defaultStudioReturnTo(env: PlatformUrlEnv = {}): string {
  const studio = trimTrailingSlash(
    env.studioUrl ?? process.env.NEXT_PUBLIC_STUDIO_URL ?? DEFAULT_STUDIO_URL,
  );
  return `${studio}/dashboard`;
}

/**
 * Auth app sign-in URL with allowlisted `return_to` (Decision 4, PLAN §5).
 * Until `apps/auth` ships, the same path works on the legacy web host.
 */
export function buildSignInUrl(
  options: PlatformUrlEnv & { returnTo?: string } = {},
): string {
  const auth = trimTrailingSlash(
    options.authUrl ?? process.env.NEXT_PUBLIC_AUTH_URL ?? DEFAULT_AUTH_URL,
  );
  const returnTo = options.returnTo ?? defaultStudioReturnTo(options);
  const params = new URLSearchParams({ return_to: returnTo });
  return `${auth}/sign-in?${params.toString()}`;
}
