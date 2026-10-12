"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

const EXEMPT_PREFIXES = ["/dashboard/onboarding"];

export function OrgOnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
          router.refresh();
        }
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return null;
  }

  return children;
}
