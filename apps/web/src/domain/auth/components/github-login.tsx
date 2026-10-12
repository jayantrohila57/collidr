"use client";

import { Github, Loader } from "lucide-react";

import { useTransition } from "react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { signInWithGithub } from "../lib/auth-actions";

export function GitHubLoginButton() {
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
      size="lg"
      className="w-80 gap-2 bg-primary hover:bg-primary/90"
    >
      {isLoading ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Github className="h-4 w-4" />
      )}
      Sign in with GitHub
    </Button>
  );
}
