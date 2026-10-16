"use client";

import { Auth5Panel } from "@loftlancer/ui/patterns/auth-5";
import { Button } from "@loftlancer/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { GitHubSignInButton } from "@/components/github-sign-in-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { authAppReturnTo } from "@/lib/auth-return-to";
import { formatDeviceUserCode } from "@/lib/format-user-code";

export function DeviceCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("user_code") ?? "";
  const [userCode, setUserCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const formatted = formatDeviceUserCode(userCode);
    if (!formatted) {
      setError("Enter the code shown in your terminal.");
      return;
    }

    const devicePath = `/device?user_code=${encodeURIComponent(formatted)}`;
    const returnTo = authAppReturnTo(devicePath);

    if (!session?.user) {
      router.push(`/sign-in?return_to=${encodeURIComponent(returnTo)}`);
      return;
    }

    setVerifying(true);
    try {
      const response = await authClient.device({
        query: { user_code: formatted },
      });
      if (response.error || !response.data) {
        setError("Invalid or expired code. Check your terminal and try again.");
        return;
      }
      router.push(
        `/device/approve?user_code=${encodeURIComponent(formatted)}` as Route,
      );
    } catch {
      setError("Invalid or expired code. Check your terminal and try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Auth5Panel showTerms={false}>
      <Card className="w-full border-0 bg-transparent shadow-none before:hidden">
        <CardHeader>
          <CardTitle>Device sign-in</CardTitle>
          <CardDescription>
            Enter the code from the Loftlancer CLI or another device. Only approve
            codes you requested on a device you control.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-4">
          {error ? (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => void handleSubmit(e)}
          >
            <Field>
              <FieldLabel htmlFor="user_code">Device code</FieldLabel>
              <Input
                id="user_code"
                name="user_code"
                autoComplete="off"
                inputMode="text"
                placeholder="ABCD-1234"
                value={userCode}
                onChange={(event) => setUserCode(event.target.value)}
                maxLength={12}
              />
              <FieldDescription>
                Codes are usually eight characters, with or without a dash.
              </FieldDescription>
            </Field>

            {isPending ? (
              <p className="text-muted-foreground text-sm">Loading session…</p>
            ) : session?.user ? (
              <Button type="submit" disabled={verifying}>
                {verifying ? "Verifying…" : "Continue"}
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-sm">
                  Sign in first, then verify your device code.
                </p>
                <GitHubSignInButton
                  returnTo={authAppReturnTo(
                    `/device?user_code=${encodeURIComponent(formatDeviceUserCode(userCode))}`,
                  )}
                />
              </div>
            )}
          </form>

          <Button variant="outline" render={<Link href="/sign-in" />}>
            Back to sign in
          </Button>
        </CardPanel>
      </Card>
    </Auth5Panel>
  );
}
