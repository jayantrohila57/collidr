"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { LoadingButton } from "@/components/patterns/loading-button";
import { resolvePostAuthPath } from "@/lib/auth-routes";
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
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    const redirectTo = resolvePostAuthPath(searchParams.get("redirect"));
    setIsLoading(true);
    void signInWithGithub({ redirectTo }).catch(() => {
      setIsLoading(false);
      toast.error("Sign in failed");
    });
  };

  return (
    <LoadingButton
      onClick={handleSignIn}
      loading={isLoading}
      loadingLabel="Redirecting to GitHub…"
      size={size}
      className={cn("gap-2", className)}
    >
      <AppIcon name="github" className="size-4" />
      {label}
    </LoadingButton>
  );
}
