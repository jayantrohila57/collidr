"use client";

import { Github } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";
import { signInWithGithub } from "../lib/auth-actions";

export function GitHubLoginButton({
  size = "lg",
}: {
  size?: "default" | "sm" | "lg";
}) {
  const [isLoading, startTransition] = useTransition();

  const handleSignIn = () => {
    startTransition(async () => {
      const toastId = toast.loading("Signing in...");
      try {
        await signInWithGithub(
          () => {
            toast.success("Sign in successful", { id: toastId });
          },
          () => {
            toast.error("Sign in failed", { id: toastId });
          },
        );
      } catch {
        toast.error("Sign in failed", { id: toastId });
      }
    });
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      size={size}
      className="gap-2"
    >
      {isLoading ? <Spinner /> : <Github className="h-4 w-4" />}
      Sign in with GitHub
    </Button>
  );
}
