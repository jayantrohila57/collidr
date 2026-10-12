"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { Skeleton } from "@/components/ui/skeleton";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import OrganizationSettingsClient from "./organization-settings-client";

export default function OrganizationSettingsGate() {
  const router = useRouter();
  const { loading, initialLoadDone, activeOrganizationId } =
    useActiveOrganization();

  useEffect(() => {
    if (!isOrganizationsEnabledOnClient()) {
      router.replace("/dashboard/settings" as Route);
    }
  }, [router]);

  if (!isOrganizationsEnabledOnClient()) {
    return null;
  }

  if (!initialLoadDone || loading) {
    return (
      <div className="space-y-4 p-4" aria-busy="true">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!activeOrganizationId) {
    return (
      <div className="p-4 text-muted-foreground text-sm">
        Select an organization from the sidebar switcher to manage settings.
      </div>
    );
  }

  return <OrganizationSettingsClient />;
}
