"use client";

import { validateReturnTo } from "@env-manager/auth/return-to";
import { Button } from "@env-manager/ui/button";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function GitHubSignInButton() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    const returnTo = validateReturnTo(searchParams.get("return_to"));
    const finishUrl = new URL(
      "/api/auth/cross-app/finish",
      window.location.origin,
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
      {loading ? "Redirecting to GitHub…" : "Continue with GitHub"}
    </Button>
  );
}
