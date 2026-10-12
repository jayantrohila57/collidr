"use client";

import { Building2, ChevronsUpDown, Plus, Settings } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

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

  const triggerButton = (
    <Button
      variant="outline"
      className={
        collapsed
          ? "mb-0 size-8 justify-center p-0"
          : "mb-2 w-full justify-between gap-2"
      }
      disabled={showInitialLoading}
      aria-label="Switch organization"
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
    </Button>
  );

  const dropdownTrigger = (
    <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
  );

  return (
    <DropdownMenu>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{dropdownTrigger}</TooltipTrigger>
          <TooltipContent side="right">{triggerLabel}</TooltipContent>
        </Tooltip>
      ) : (
        dropdownTrigger
      )}
      <DropdownMenuContent
        side={collapsed ? "right" : "bottom"}
        align="start"
        sideOffset={collapsed ? 8 : 4}
        className={
          collapsed
            ? "w-60 min-w-60"
            : "w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
        }
      >
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onSelect={() => void onSelectOrg(org.id)}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <span className="truncate">{org.name}</span>
            {org.id === activeOrganizationId && (
              <span className="ml-auto text-muted-foreground text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={"/dashboard/settings/organization" as Route}>
            <Settings className="mr-2 h-4 w-4" />
            Organization settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/dashboard/onboarding")}>
          <Plus className="mr-2 h-4 w-4" />
          Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
