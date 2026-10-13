"use client";

import { ImpersonationBanner } from "@collidr/ui/patterns/impersonation-banner";
import type { createCollidrAuthClient } from "./create-auth-client";

type AuthClient = ReturnType<typeof createCollidrAuthClient>;

type SessionPayload = {
  session?: { impersonatedBy?: string | null };
  user?: { email?: string | null; name?: string | null };
};

export function getImpersonatedByUserId(
  data: SessionPayload | null | undefined,
): string | null | undefined {
  return data?.session?.impersonatedBy ?? null;
}

export function CollidrImpersonationBanner({
  authClient,
}: {
  authClient: AuthClient;
}) {
  const { data } = authClient.useSession();
  const impersonatedBy = getImpersonatedByUserId(
    data as SessionPayload | null | undefined,
  );
  const subjectLabel = data?.user?.email ?? data?.user?.name ?? undefined;

  return (
    <ImpersonationBanner
      impersonatedByUserId={impersonatedBy}
      subjectLabel={subjectLabel}
      onStopImpersonating={() => {
        void authClient.admin.stopImpersonating({});
      }}
    />
  );
}
