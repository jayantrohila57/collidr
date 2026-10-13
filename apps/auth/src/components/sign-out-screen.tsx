"use client";

import { validateReturnTo } from "@env-manager/auth/return-to";
import { Button } from "@env-manager/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@env-manager/ui/card";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
          <CardDescription>
            You will be signed out of Env Manager on this browser and returned
            to your application.
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
    </div>
  );
}
