"use client";

import { describeMcpOAuthScopes } from "@loftlancer/actions";
import { Button } from "@loftlancer/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GitHubSignInButton } from "@/components/github-sign-in-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client";

type ConsentScreenProps = {
  clientId: string;
  scope: string | null;
  claimsJson: string | null;
  consentReturnTo: string;
};

export function ConsentScreen({
  clientId,
  scope,
  claimsJson,
  consentReturnTo,
}: ConsentScreenProps) {
  const { data: session, isPending } = authClient.useSession();
  const [clientName, setClientName] = useState<string | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [submitting, setSubmitting] = useState<"approve" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scopeItems = describeMcpOAuthScopes(scope);

  useEffect(() => {
    if (!session?.user) {
      setLoadingClient(false);
      return;
    }
    let cancelled = false;
    void authClient.oauth2
      .publicClient({
        query: { client_id: clientId },
      })
      .then(({ data, error: clientError }) => {
        if (cancelled) return;
        if (clientError || !data) {
          setError("Could not load application details.");
          return;
        }
        setClientName(data.client_name ?? data.client_id ?? clientId);
      })
      .finally(() => {
        if (!cancelled) setLoadingClient(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, session?.user]);

  const handleConsent = async (accept: boolean) => {
    setSubmitting(accept ? "approve" : "deny");
    setError(null);
    try {
      const requestedClaims = claimsJson ? JSON.parse(claimsJson) : undefined;
      const { data, error: consentError } = await authClient.oauth2.consent({
        accept,
        ...(scope ? { scope } : {}),
        ...(requestedClaims !== undefined ? { claims: requestedClaims } : {}),
      });
      const redirectTarget =
        data && "redirect_uri" in data && typeof data.redirect_uri === "string"
          ? data.redirect_uri
          : data && "url" in data && typeof data.url === "string"
            ? data.url
            : null;
      if (consentError || !redirectTarget) {
        setError("Authorization could not be completed. Try again.");
        return;
      }
      window.location.assign(redirectTarget);
    } catch {
      setError("Authorization could not be completed. Try again.");
    } finally {
      setSubmitting(null);
    }
  };

  const displayName = clientName ?? clientId;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authorize application</CardTitle>
          <CardDescription>
            Review what <span className="font-medium">{displayName}</span> is
            requesting before you continue.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-4">
          {error ? (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {isPending || loadingClient ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : null}

          {!isPending && !session?.user ? (
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground text-sm">
                Sign in to approve access for this application.
              </p>
              <GitHubSignInButton returnTo={consentReturnTo} />
            </div>
          ) : null}

          {session?.user ? (
            <>
              <div>
                <p className="font-medium text-sm">Requested access</p>
                {scopeItems.length === 0 ? (
                  <p className="mt-2 text-muted-foreground text-sm">
                    No additional scopes were requested.
                  </p>
                ) : (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {scopeItems.map((item) => (
                      <li key={item.scope}>
                        <span className="font-medium">{item.description}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          ({item.scope})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  className="flex-1"
                  disabled={submitting !== null}
                  onClick={() => void handleConsent(true)}
                >
                  {submitting === "approve" ? "Approving…" : "Approve"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={submitting !== null}
                  onClick={() => void handleConsent(false)}
                >
                  {submitting === "deny" ? "Denying…" : "Deny"}
                </Button>
              </div>
            </>
          ) : null}

          <Button variant="ghost" render={<Link href="/sign-in" />}>
            Back to sign in
          </Button>
        </CardPanel>
      </Card>
    </div>
  );
}
