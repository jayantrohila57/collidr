"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { Skeleton } from "@/components/ui/skeleton";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { OrganizationSettingsForm } from "./organization-settings-client";

export default function OrganizationSettingsGate() {
  const router = useRouter();
  const { loading, initialLoadDone, activeOrganizationId, isSwitching } =
    useActiveOrganization();

  useEffect(() => {
    if (!isOrganizationsEnabledOnClient()) {
      router.replace("/dashboard/settings" as Route);
    }
  }, [router]);

  if (!isOrganizationsEnabledOnClient()) {
    return null;
  }

  if (!initialLoadDone || loading || isSwitching || !activeOrganizationId) {
    return (
      <div className="space-y-4 p-4" aria-busy="true">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <OrganizationSettingsForm
      key={activeOrganizationId}
      organizationId={activeOrganizationId}
    />
  );
}
