"use client";

import { Github } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";
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
      className={cn("gap-2", className)}
    >
      {isLoading ? <Spinner /> : <Github className="h-4 w-4" />}
      {label}
    </Button>
  );
}
