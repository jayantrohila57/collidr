export const SIGN_IN_PATH = "/sign-in";

/** Accept only same-origin relative paths for post-login redirects. */
export function safeRedirectPath(
  path: string | null | undefined,
): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return null;
  }
  if (path === SIGN_IN_PATH || path.startsWith(`${SIGN_IN_PATH}?`)) {
    return null;
  }
  return path;
}

export function resolvePostAuthPath(
  redirectParam: string | null | undefined,
): string {
  return safeRedirectPath(redirectParam) ?? "/dashboard";
}
