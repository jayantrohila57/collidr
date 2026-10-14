"use client";

import { Building2, ChevronsUpDown, Plus, Settings } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { OrgListItem } from "@/components/org/active-organization-context";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { actionToast } from "@/lib/action-toast";
import { initialsFromLabel } from "@/lib/initials";
import { isPersonalOrganization } from "@/lib/org-personal";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

function orgSubtitle(org: OrgListItem | undefined): string {
  if (!org) return "Workspace";
  if (isPersonalOrganization(org)) return "Personal";
  return "Team";
}

export function OrgSwitcher() {
  const router = useRouter();
  const { state, isMobile } = useSidebar();
  const menuOnRight = state === "collapsed" && !isMobile;
  const {
    orgs,
    activeOrganizationId,
    loading,
    initialLoadDone,
    setActiveOrganization,
  } = useActiveOrganization();

  if (!isOrganizationsEnabledOnClient()) {
    return null;
  }

  const active = orgs.find((o) => o.id === activeOrganizationId) ?? orgs[0];
  const resolvingActiveLabel =
    Boolean(activeOrganizationId) &&
    orgs.length > 0 &&
    !active?.name &&
    !loading;
  const showInitialLoading =
    (!initialLoadDone && loading) || resolvingActiveLabel;

  const onSelectOrg = async (organizationId: string) => {
    if (organizationId === activeOrganizationId) return;
    try {
      await actionToast(setActiveOrganization(organizationId), {
        loading: "Switching organization…",
        success: "Organization switched",
        error: "Could not switch organization",
      });
    } catch {
      // Toast handled by actionToast
    }
  };

  const triggerLabel = showInitialLoading
    ? "Loading organization"
    : (active?.name ?? "Select organization");

  const switcherBody = showInitialLoading ? (
    <>
      <Skeleton className="size-8 shrink-0 rounded-lg" />
      <div className="grid min-w-0 flex-1 gap-0.5 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
    </>
  ) : (
    <>
      <Avatar className="size-8 shrink-0 rounded-lg">
        <AvatarFallback className="rounded-lg text-xs">
          {active?.name ? initialsFromLabel(active.name, "OR") : "OR"}
        </AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 flex-1 gap-0.5 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate font-medium">
          {active?.name ?? "Select organization"}
        </span>
        <span className="truncate text-muted-foreground text-xs">
          {orgSubtitle(active)}
        </span>
      </div>
      {!isMobile ? (
        <ChevronsUpDown
          className="ms-auto size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
          aria-hidden
        />
      ) : null}
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menu modal>
          <MenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                disabled={showInitialLoading}
                aria-label="Switch organization"
                tooltip={triggerLabel}
              />
            }
          >
            {switcherBody}
          </MenuTrigger>
          <MenuPopup
            side={isMobile ? "top" : menuOnRight ? "right" : "bottom"}
            align="start"
            sideOffset={isMobile ? 8 : menuOnRight ? 8 : 4}
            className="min-w-56"
          >
            <MenuGroup>
              <MenuGroupLabel>Organizations</MenuGroupLabel>
              {orgs.map((org) => (
                <MenuItem key={org.id} onClick={() => void onSelectOrg(org.id)}>
                  <Building2 className="me-2 size-4" aria-hidden />
                  <span className="truncate">{org.name}</span>
                  {org.id === activeOrganizationId ? (
                    <span className="ms-auto text-muted-foreground text-xs">
                      ✓
                    </span>
                  ) : null}
                </MenuItem>
              ))}
            </MenuGroup>
            <MenuSeparator />
            <MenuLinkItem href={"/dashboard/organizations" as Route}>
              <Settings className="me-2 size-4" aria-hidden />
              Manage organizations
            </MenuLinkItem>
            <MenuItem onClick={() => router.push("/dashboard/onboarding")}>
              <Plus className="me-2 size-4" aria-hidden />
              Create organization
            </MenuItem>
          </MenuPopup>
        </Menu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
