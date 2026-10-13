"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { authClient } from "@/lib/auth-client";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

const EXEMPT_PREFIXES = [
  "/dashboard/onboarding",
  "/dashboard/settings/organization",
  "/dashboard/organizations",
];

export function OrgOnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: sessionPending } = useSession();
  const [ready, setReady] = useState(!isOrganizationsEnabledOnClient());

  useEffect(() => {
    if (!isOrganizationsEnabledOnClient()) {
      return;
    }

    if (EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      setReady(true);
      return;
    }

    if (sessionPending) {
      return;
    }

    const activeId = (
      session?.session as { activeOrganizationId?: string | null }
    )?.activeOrganizationId;

    if (activeId) {
      setReady(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const list = await authClient.organization.list();
        const orgs = list.data ?? [];

        if (orgs.length === 0) {
          router.replace("/dashboard/onboarding");
          return;
        }

        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, session, sessionPending]);

  if (!ready) {
    return (
      <div
        className="flex min-h-48 flex-1 items-center justify-center py-12"
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return children;
}
