import {
  buildSignOutUrl,
  defaultAppSignInAfterSignOut,
  resolveAuthAppOrigin,
} from "./auth-links";

export type PlatformSignOutOptions = {
  /** Clear React Query (or other) client caches before navigating away. */
  onClearClient?: () => void;
  /** Revoke the session on this app origin (sibling `/api/auth`). */
  signOutLocal?: () => Promise<unknown>;
  /** Override post sign-out redirect target passed to the auth app. */
  returnTo?: string;
};

/**
 * End the Loftlancer session globally: clear local client state, revoke the
 * sibling cookie on this origin, then open the auth app sign-out screen (shared
 * `.loftlancer.com` session cookie + DB session revocation).
 */
export async function performPlatformSignOut(
  options: PlatformSignOutOptions = {},
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  options.onClearClient?.();

  // App URL including its Next basePath (e.g. https://loftlancer.com/studio).
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  const appOrigin = `${window.location.origin}${basePath}`;
  const authOrigin = resolveAuthAppOrigin();
  const onAuthHost = appOrigin === authOrigin;
  const returnTo =
    options.returnTo ?? defaultAppSignInAfterSignOut(appOrigin);

  if (onAuthHost) {
    if (options.signOutLocal) {
      try {
        await options.signOutLocal();
      } catch {
        // Continue to redirect even if the client sign-out request fails.
      }
    }
    window.location.assign(returnTo);
    return;
  }

  if (options.signOutLocal) {
    try {
      await options.signOutLocal();
    } catch {
      // Auth sign-out still revokes the server session.
    }
  }

  window.location.assign(buildSignOutUrl({ returnTo }));
}
