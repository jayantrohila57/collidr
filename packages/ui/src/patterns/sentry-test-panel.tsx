"use client";

import { useId, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export type SentryTestResult =
  | { status: "sent"; eventId?: string }
  | { status: "rejected" };

/**
 * Small panel for the Sentry test-error pages (#354). The app passes
 * `onTrigger`, which throws from app code and reports to Sentry. With
 * `requireToken`, the token is only kept in component state, sent once in a
 * header and cleared afterwards. The result line keeps a fixed height.
 */
export function SentryTestPanel({
  app,
  requireToken,
  onTrigger,
}: {
  app: string;
  requireToken: boolean;
  onTrigger: (token: string) => Promise<SentryTestResult>;
}) {
  const inputId = useId();
  const [token, setToken] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SentryTestResult | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      setResult(await onTrigger(token));
    } catch {
      setResult({ status: "rejected" });
    } finally {
      setToken("");
      setPending(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center p-4">
      <form
        onSubmit={submit}
        className="flex flex-col gap-3 rounded-xl bg-card p-4 text-card-foreground text-sm ring-1 ring-border"
      >
        <div className="space-y-0.5">
          <h1 className="font-semibold text-sm">Sentry test error</h1>
          <p className="text-muted-foreground text-xs">
            Sends one browser test error from {app} to Sentry, tagged{" "}
            <code>test: true</code>.
          </p>
        </div>
        {requireToken ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={inputId} className="font-medium text-xs">
              Test token
            </label>
            <Input
              id={inputId}
              type="password"
              autoComplete="off"
              className="h-8"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
        ) : null}
        <Button
          type="submit"
          size="sm"
          disabled={pending || (requireToken && token.length === 0)}
        >
          Throw browser test error
        </Button>
        <p className="min-h-4 text-muted-foreground text-xs" aria-live="polite">
          {result?.status === "sent"
            ? `Sent${result.eventId ? `, event ${result.eventId}` : ""}.`
            : result?.status === "rejected"
              ? "Not accepted."
              : ""}
        </p>
      </form>
    </main>
  );
}
