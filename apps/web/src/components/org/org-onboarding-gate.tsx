"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { invalidateAfterOrganizationChange } from "@/lib/invalidate-org-queries";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

const EXEMPT_PREFIXES = [
  "/dashboard/onboarding",
  "/dashboard/settings/organization",
  "/dashboard/organizations",
];

export function OrgOnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(!isOrganizationsEnabledOnClient());

  useEffect(() => {
    if (!isOrganizationsEnabledOnClient()) {
      return;
    }

    if (EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      setReady(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const session = await authClient.getSession();
        const activeId = (
          session.data?.session as { activeOrganizationId?: string | null }
        )?.activeOrganizationId;

        if (activeId) {
          if (!cancelled) setReady(true);
          return;
        }

        const list = await authClient.organization.list();
        const orgs = list.data ?? [];

        if (orgs.length === 0) {
          router.replace("/dashboard/onboarding");
          return;
        }

        const firstOrg = orgs[0];
        if (firstOrg?.id) {
          await authClient.organization.setActive({
            organizationId: firstOrg.id,
          });
          await invalidateAfterOrganizationChange(queryClient);
          router.refresh();
          if (!cancelled) setReady(true);
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
  }, [pathname, queryClient, router]);

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
