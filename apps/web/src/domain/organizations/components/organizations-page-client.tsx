"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageHeaderActionButton } from "@/components/layout/app-layout";
import DashboardSection from "@/components/section-dashboard";
import { Can } from "@/domain/permissions/components/can";
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
          <Can action="organization.create">
            <PageHeaderActionButton
              label="New organization"
              onClick={openCreate}
            />
          </Can>
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
