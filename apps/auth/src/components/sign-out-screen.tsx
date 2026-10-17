"use client";

import { validateReturnTo } from "@loftlancer/auth/return-to";
import { Alert, AlertDescription } from "@loftlancer/ui/alert";
import { Button } from "@loftlancer/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import { Auth5Panel } from "@loftlancer/ui/patterns/auth-5";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutScreen() {
  const searchParams = useSearchParams();
  const returnTo = validateReturnTo(searchParams.get("return_to"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = () => {
    setLoading(true);
    setError(null);
    void authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.assign(returnTo);
        },
        onError: () => {
          setError("Sign-out failed. Try again.");
          setLoading(false);
        },
      },
    });
  };

  return (
    <Auth5Panel showTerms={false}>
      <Card className="w-full border-0 bg-transparent shadow-none before:hidden">
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
          <CardDescription>
            You will be signed out of Loftlancer on this browser and returned to
            your application.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-4">
          {error ? (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <p className="text-muted-foreground text-sm">
            After signing out you will be redirected to:
            <br />
            <span className="break-all font-medium text-foreground">
              {returnTo}
            </span>
          </p>
          <Button type="button" disabled={loading} onClick={handleSignOut}>
            {loading ? "Signing out…" : "Sign out"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.location.assign(returnTo);
            }}
          >
            Cancel
          </Button>
        </CardPanel>
      </Card>
    </Auth5Panel>
  );
}
