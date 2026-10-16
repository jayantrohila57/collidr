"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { PageHeaderActionButton } from "@/components/layout/app-layout";
import DashboardSection from "@/components/section-dashboard";
import { Can } from "@/domain/permissions/components/can";
import { routes } from "@/utils/navigation";
import { CreateOrganizationSheet } from "./create-organization-sheet";
import { OrganizationsList } from "./organizations-list";
import { OrganizationsListStats } from "./organizations-list-stats";

/**
 * Studio home (#299): the org list. `/new` renders the same page with the
 * create sheet open; closing it returns to `/`.
 */
export function OrganizationsPageClient({
  createRoute = false,
}: {
  createRoute?: boolean;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(createRoute);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    if (createRoute) {
      router.replace(routes.home(), { scroll: false });
    }
  }, [createRoute, router]);

  const openCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  return (
    <>
      <DashboardSection
        title="Organizations"
        description="Workspaces you belong to, with members, teams, and access settings."
        back={false}
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
