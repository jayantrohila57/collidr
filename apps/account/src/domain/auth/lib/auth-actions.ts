"use client";

import type { QueryClient } from "@tanstack/react-query";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { authClient } from "@/lib/auth-client";
import { PUBLIC_HOME_PATH, resolvePostAuthPath } from "@/lib/auth-routes";

/**
 * Get current session with loading state
 */
export function useSession() {
  return authClient.useSession();
}

function readRedirectSearchParam(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return new URLSearchParams(window.location.search).get("redirect");
}

/**
 * Sign in with GitHub (OAuth redirect).
 */
export async function signInWithGithub(options?: {
  redirectTo?: string;
}): Promise<void> {
  const redirectTo =
    options?.redirectTo ?? resolvePostAuthPath(readRedirectSearchParam());
  const callbackURL =
    typeof window !== "undefined"
      ? `${window.location.origin}${redirectTo}`
      : redirectTo;

  await authClient.signIn.social({
    provider: "github",
    callbackURL,
  });
}

/**
 * Sign out, clear client caches, and return to the public home landing.
 */
export async function performSignOut(options: {
  queryClient: QueryClient;
  router: AppRouterInstance;
}): Promise<void> {
  const { queryClient, router } = options;

  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        queryClient.clear();
        router.replace(PUBLIC_HOME_PATH);
        router.refresh();
      },
    },
  });
}

/** @deprecated Use performSignOut with queryClient and router */
export async function signOut(
  onSuccess: () => void,
  onError: (error: Error) => void,
) {
  try {
    await authClient.signOut(
      {},
      {
        onSuccess,
        onError: () => {},
      },
    );
  } catch (error) {
    onError(error as unknown as Error);
  }
}

export async function updateProfile(input: { name?: string; image?: string }) {
  const result = await authClient.updateUser(input);
  if (result.error) {
    throw new Error(result.error.message ?? "Could not update profile");
  }
  return result.data;
}

export async function listAuthSessions() {
  const result = await authClient.listSessions();
  if (result.error) {
    throw new Error(result.error.message ?? "Could not load sessions");
  }
  return result.data ?? [];
}

export async function revokeAuthSession(token: string) {
  const result = await authClient.revokeSession({ token });
  if (result.error) {
    throw new Error(result.error.message ?? "Could not revoke session");
  }
  return result.data;
}

export async function revokeOtherAuthSessions() {
  const result = await authClient.revokeOtherSessions();
  if (result.error) {
    throw new Error(result.error.message ?? "Could not revoke other sessions");
  }
  return result.data;
}

export async function linkGithubAccount() {
  const callbackURL =
    typeof window !== "undefined"
      ? `${window.location.origin}/settings?tab=accounts`
      : "/settings?tab=accounts";
  const result = await authClient.$fetch("/link-social", {
    method: "POST",
    body: {
      provider: "github",
      callbackURL,
    },
  });
  if (result.error) {
    throw new Error(result.error.message ?? "Could not link GitHub");
  }
  return result.data;
}

export async function unlinkProviderAccount(accountId: string) {
  const result = await authClient.unlinkAccount({ accountId });
  if (result.error) {
    throw new Error(result.error.message ?? "Could not unlink account");
  }
  return result.data;
}
