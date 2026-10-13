"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { Skeleton } from "@/components/ui/skeleton";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

export function OrganizationSettingsRedirect() {
  const router = useRouter();
  const { orgs, activeOrganizationId, initialLoadDone, loading } =
    useActiveOrganization();

  useEffect(() => {
    if (!isOrganizationsEnabledOnClient()) {
      router.replace("/settings" as Route);
      return;
    }
    if (!initialLoadDone || loading) return;

    const active = orgs.find((o) => o.id === activeOrganizationId) ?? orgs[0];
    if (active?.slug) {
      router.replace(
        `/dashboard/organizations/${active.slug}/settings` as Route,
      );
      return;
    }
    router.replace("/dashboard/organizations" as Route);
  }, [activeOrganizationId, initialLoadDone, loading, orgs, router]);

  return (
    <div className="flex flex-col gap-2" aria-busy="true">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
