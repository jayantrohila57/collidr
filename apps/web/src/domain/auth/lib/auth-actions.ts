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
