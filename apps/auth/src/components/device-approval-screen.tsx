"use client";

import { describeMcpOAuthScopes } from "@collidr/actions";
import { Button } from "@collidr/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@collidr/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client";
import { authAppReturnTo } from "@/lib/auth-return-to";
import { formatDeviceUserCode } from "@/lib/format-user-code";

type DeviceRequest = {
  client_id?: string;
  scope?: string;
  resource?: string | string[];
  user_code?: string;
};

type DeviceApprovalScreenProps = {
  userCode: string;
};

export function DeviceApprovalScreen({ userCode }: DeviceApprovalScreenProps) {
  const router = useRouter();
  const formattedCode = formatDeviceUserCode(userCode);
  const { data: session, isPending } = authClient.useSession();
  const [request, setRequest] = useState<DeviceRequest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"approve" | "deny" | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      const returnTo = authAppReturnTo(
        `/device/approve?user_code=${encodeURIComponent(formattedCode)}`,
      );
      router.replace(`/sign-in?return_to=${encodeURIComponent(returnTo)}`);
      return;
    }
    let cancelled = false;
    void authClient
      .device({ query: { user_code: formattedCode } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setLoadError("This code is invalid or expired.");
          return;
        }
        setRequest(data as DeviceRequest);
      });
    return () => {
      cancelled = true;
    };
  }, [formattedCode, isPending, router, session?.user]);

  const scopeItems = describeMcpOAuthScopes(request?.scope ?? null);
  const resources = request?.resource
    ? Array.isArray(request.resource)
      ? request.resource
      : [request.resource]
    : [];

  const handleApprove = async () => {
    setSubmitting("approve");
    setLoadError(null);
    try {
      const { error } = await authClient.device.approve({
        userCode: formattedCode,
      });
      if (error) {
        setLoadError("Could not approve this device. Try again.");
        return;
      }
      setDoneMessage(
        "Device approved. You can return to your terminal or device.",
      );
    } catch {
      setLoadError("Could not approve this device. Try again.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleDeny = async () => {
    setSubmitting("deny");
    setLoadError(null);
    try {
      const { error } = await authClient.device.deny({
        userCode: formattedCode,
      });
      if (error) {
        setLoadError("Could not deny this request. Try again.");
        return;
      }
      setDoneMessage("Request denied. The device will not be signed in.");
    } catch {
      setLoadError("Could not deny this request. Try again.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Approve device</CardTitle>
          <CardDescription>
            Confirm that code <span className="font-mono">{formattedCode}</span>{" "}
            matches what your device is showing before you continue.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-4">
          {loadError ? (
            <Alert variant="error">
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          ) : null}
          {doneMessage ? (
            <Alert variant="success">
              <AlertDescription>{doneMessage}</AlertDescription>
            </Alert>
          ) : null}

          {request && !doneMessage ? (
            <>
              <div className="text-sm">
                <p>
                  <span className="text-muted-foreground">Client: </span>
                  <span className="font-medium">
                    {request.client_id ?? "Unknown client"}
                  </span>
                </p>
                {resources.length > 0 ? (
                  <p className="mt-2">
                    <span className="text-muted-foreground">Resource: </span>
                    <span className="font-medium">{resources.join(", ")}</span>
                  </p>
                ) : null}
              </div>
              {scopeItems.length > 0 ? (
                <div>
                  <p className="font-medium text-sm">Requested access</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {scopeItems.map((item) => (
                      <li key={item.scope}>{item.description}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <p className="text-muted-foreground text-sm">
                Approve only if you started this sign-in on a device you own.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  className="flex-1"
                  disabled={submitting !== null}
                  onClick={() => void handleApprove()}
                >
                  {submitting === "approve" ? "Approving…" : "Approve"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={submitting !== null}
                  onClick={() => void handleDeny()}
                >
                  {submitting === "deny" ? "Denying…" : "Deny"}
                </Button>
              </div>
            </>
          ) : null}

          <Button variant="ghost" render={<Link href="/device" />}>
            Enter a different code
          </Button>
        </CardPanel>
      </Card>
    </div>
  );
}
