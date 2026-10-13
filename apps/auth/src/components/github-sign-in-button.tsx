"use client";

import { validateReturnTo } from "@collidr/auth/return-to";
import { publicServicePath } from "@collidr/env/vercel-services";
import { Button } from "@collidr/ui/button";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type GitHubSignInButtonProps = {
  returnTo?: string;
  label?: string;
};

export function GitHubSignInButton({
  returnTo: returnToOverride,
  label = "Continue with GitHub",
}: GitHubSignInButtonProps = {}) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    const returnTo = validateReturnTo(
      returnToOverride ?? searchParams.get("return_to"),
    );
    const finishUrl = new URL(
      publicServicePath("auth", "/api/auth/cross-app/finish"),
    );
    finishUrl.searchParams.set("return_to", returnTo);

    setLoading(true);
    void authClient.signIn
      .social({
        provider: "github",
        callbackURL: finishUrl.toString(),
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <Button
      type="button"
      className="w-full"
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? "Redirecting to GitHub…" : label}
    </Button>
  );
}
