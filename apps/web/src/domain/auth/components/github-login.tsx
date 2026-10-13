"use client";

import { useTransition } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { LoadingButton } from "@/components/patterns/loading-button";
import { actionToast } from "@/lib/action-toast";
import { cn } from "@/lib/utils";
import { signInWithGithub } from "../lib/auth-actions";

export function GitHubLoginButton({
  size = "lg",
  label = "Sign in with GitHub",
  className,
}: {
  size?: "default" | "sm" | "lg";
  label?: string;
  className?: string;
}) {
  const [isLoading, startTransition] = useTransition();

  const handleSignIn = () => {
    startTransition(async () => {
      try {
        await actionToast(
          new Promise<void>((resolve, reject) => {
            void signInWithGithub(
              () => resolve(),
              (error) => reject(error),
            );
          }),
          {
            loading: "Signing in…",
            success: "Sign in successful",
            error: "Sign in failed",
          },
        );
      } catch {
        // Toast handled by actionToast
      }
    });
  };

  return (
    <LoadingButton
      onClick={handleSignIn}
      loading={isLoading}
      loadingLabel="Signing in…"
      size={size}
      className={cn("gap-2", className)}
    >
      <AppIcon name="github" className="size-4" />
      {label}
    </LoadingButton>
  );
}
