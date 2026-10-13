import { buildSignInUrl } from "@env-manager/ui/auth-links";
import { absoluteReturnToFromRelativePath, validateReturnTo } from "../return-to";
import { trimTrailingSlash } from "../platform-urls";

export type SignInRedirectMode = "platform" | "legacy";

export type SignInRedirectOptions = {
  appOrigin: string;
  returnPath: string;
  mode?: SignInRedirectMode;
};

/** Absolute return_to for platform auth sign-in. */
export function buildPlatformSignInRedirectUrl(
  options: SignInRedirectOptions,
): string {
  const origin = trimTrailingSlash(options.appOrigin);
  const returnTo = validateReturnTo(
    `${origin}${options.returnPath.startsWith("/") ? options.returnPath : `/${options.returnPath}`}`,
  );
  return buildSignInUrl({ returnTo });
}

/** Legacy web host: relative `/sign-in?redirect=…`. */
export function buildLegacySignInRedirectPath(returnPath: string): string {
  const path =
    returnPath.startsWith("/") && !returnPath.startsWith("//")
      ? returnPath
      : "/dashboard";
  return `/sign-in?redirect=${encodeURIComponent(path)}`;
}

export function resolveSignInRedirect(
  options: SignInRedirectOptions,
): string {
  const mode = options.mode ?? "platform";
  if (mode === "legacy") {
    return buildLegacySignInRedirectPath(options.returnPath);
  }
  return buildPlatformSignInRedirectUrl(options);
}

export function buildBannedUserSignOutUrl(options: {
  appOrigin: string;
  mode?: SignInRedirectMode;
}): string {
  const mode = options.mode ?? "platform";
  if (mode === "legacy") {
    return `/api/auth/sign-out?callbackUrl=${encodeURIComponent("/sign-in")}`;
  }
  const authSignIn = buildPlatformSignInRedirectUrl({
    appOrigin: options.appOrigin,
    returnPath: "/dashboard",
  });
  const authOrigin = new URL(authSignIn).origin;
  return `${authOrigin}/sign-out?return_to=${encodeURIComponent(authSignIn)}`;
}

export function absoluteReturnPath(
  appOrigin: string,
  returnPath: string,
): string {
  return (
    absoluteReturnToFromRelativePath(returnPath, appOrigin) ??
    validateReturnTo(null)
  );
}
