"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import DashboardSection from "@/components/section-dashboard";
import { Button } from "@/components/ui/button";
import { CreateOrganizationSheet } from "./create-organization-sheet";
import { OrganizationsList } from "./organizations-list";
import { OrganizationsListStats } from "./organizations-list-stats";

export function OrganizationsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
    }
  }, [searchParams]);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    if (searchParams.get("create") === "1") {
      router.replace("/dashboard/organizations");
    }
  }, [router, searchParams]);

  const openCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  return (
    <>
      <DashboardSection
        title="Organizations"
        description="Workspaces you belong to, with members, teams, and access settings."
        action={
          <Button
            type="button"
            size="sm"
            className="gap-2 max-sm:size-8 max-sm:gap-0 max-sm:px-0"
            onClick={openCreate}
          >
            <AppIcon name="plus" className="text-current" />
            <span className="sr-only sm:not-sr-only">New organization</span>
          </Button>
        }
        stats={<OrganizationsListStats />}
      >
        <OrganizationsList onCreateOrganization={openCreate} />
      </DashboardSection>
      <CreateOrganizationSheet
        open={createOpen}
        onOpenChange={(next) => {
          if (next) setCreateOpen(true);
          else closeCreate();
        }}
      />
    </>
  );
}
