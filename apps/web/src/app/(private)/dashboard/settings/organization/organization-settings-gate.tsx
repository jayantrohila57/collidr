"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
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
      <PageContainer size="narrow" aria-busy="true">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
        </div>
      </PageContainer>
    );
  }

  return (
    <OrganizationSettingsForm
      key={activeOrganizationId}
      organizationId={activeOrganizationId}
    />
  );
}
