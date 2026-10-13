"use client";

import { Building2, ChevronsUpDown, Plus, Settings } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { toast } from "@/lib/toast";

export function OrgSwitcher() {
  const router = useRouter();
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === "collapsed";
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

  const showInitialLoading = !initialLoadDone && loading;
  const active = orgs.find((o) => o.id === activeOrganizationId) ?? orgs[0];

  const onSelectOrg = async (organizationId: string) => {
    if (organizationId === activeOrganizationId) return;
    try {
      await setActiveOrganization(organizationId);
    } catch {
      toast.error("Could not switch organization");
    }
  };

  const triggerLabel = showInitialLoading
    ? "Loading organization"
    : (active?.name ?? "Select organization");

  const menuTrigger = (
    <MenuTrigger
      render={
        <Button
          variant="outline"
          className={
            collapsed
              ? "mb-0 size-8 justify-center p-0"
              : "mb-2 w-full justify-between gap-2"
          }
          disabled={showInitialLoading}
          aria-label="Switch organization"
        />
      }
    >
      <span
        className={
          collapsed
            ? "flex items-center justify-center"
            : "flex min-w-0 items-center gap-2"
        }
      >
        {showInitialLoading ? (
          <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
        ) : (
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarFallback className="text-xs">
              {active?.name?.slice(0, 2).toUpperCase() ?? ""}
            </AvatarFallback>
          </Avatar>
        )}
        {!collapsed && (
          <span className="truncate text-sm">
            {showInitialLoading
              ? "Loading…"
              : (active?.name ?? "Select organization")}
          </span>
        )}
      </span>
      {!collapsed && <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />}
    </MenuTrigger>
  );

  return (
    <Menu>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger render={menuTrigger} />
          <TooltipPopup side="right">{triggerLabel}</TooltipPopup>
        </Tooltip>
      ) : (
        menuTrigger
      )}
      <MenuPopup
        side={collapsed ? "right" : "bottom"}
        align="start"
        sideOffset={collapsed ? 8 : 4}
        className={collapsed ? "w-60 min-w-60" : "w-full min-w-56"}
      >
        <MenuGroup>
          <MenuGroupLabel>Organizations</MenuGroupLabel>
          {orgs.map((org) => (
            <MenuItem key={org.id} onClick={() => void onSelectOrg(org.id)}>
              <Building2 className="me-2 h-4 w-4" />
              <span className="truncate">{org.name}</span>
              {org.id === activeOrganizationId && (
                <span className="ms-auto text-muted-foreground text-xs">✓</span>
              )}
            </MenuItem>
          ))}
        </MenuGroup>
        <MenuSeparator />
        <MenuLinkItem href={"/dashboard/settings/organization" as Route}>
          <Settings className="me-2 h-4 w-4" />
          Organization settings
        </MenuLinkItem>
        <MenuItem onClick={() => router.push("/dashboard/onboarding")}>
          <Plus className="me-2 h-4 w-4" />
          Create organization
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}
