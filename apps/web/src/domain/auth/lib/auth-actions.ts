"use client";

import { authClient } from "@/lib/auth-client";

/**
 * Get current session with loading state
 */
export function useSession() {
  return authClient.useSession();
}

/**
 * Sign in with GitHub provider
 */
export async function signInWithGithub(
  onSuccess: () => void,
  onError: (error: Error) => void,
) {
  try {
    await authClient.signIn.social(
      {
        provider: "github",
      },
      {
        onSuccess,
        onError: () => {}, // Error handled in catch
      },
    );
  } catch (error) {
    onError(error as unknown as Error);
  }
}

/**
 * Sign out current user
 */
export async function signOut(
  onSuccess: () => void,
  onError: (error: Error) => void,
) {
  try {
    await authClient.signOut(
      {},
      {
        onSuccess,
        onError: () => {}, // Error handled in catch
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
      ? `${window.location.origin}/dashboard/settings?tab=accounts`
      : "/dashboard/settings?tab=accounts";
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

export async function unlinkProviderAccount(providerId: string) {
  const result = await authClient.unlinkAccount({ providerId });
  if (result.error) {
    throw new Error(result.error.message ?? "Could not unlink account");
  }
  return result.data;
}
