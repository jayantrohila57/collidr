"use client";

import { accountSettingsNav } from "@loftlancer/actions/nav";
import { routes } from "@loftlancer/ui/studio-routes";
import { Home } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { studioDashboardPath } from "@/lib/studio-url";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  settings: "Settings",
  profile: "Profile",
  security: "Security",
  sessions: "Sessions",
  accounts: "Connected accounts",
  notifications: "Notifications",
  export: "Export",
  delete: "Delete account",
  danger: "Danger zone",
  timeline: "Timeline",
};

function segmentLabel(segment: string) {
  // Exact match only; the old fallback matched "/settings/profile" for every tab.
  const fromNav = accountSettingsNav.find(
    (item) => item.href === `/settings/${segment}`,
  );
  return LABELS[segment] ?? fromNav?.label ?? segment;
}

export function SettingsBreadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/settings";
  const segments = pathname.split("/").filter(Boolean);
  const studioHref = studioDashboardPath(routes.home());

  const crumbs = segments[0] === "settings" ? segments.slice(1) : segments;

  const currentLabel =
    crumbs.length === 0
      ? "Profile"
      : segmentLabel(crumbs[crumbs.length - 1] ?? "profile");

  return (
    <Breadcrumb className={cn("min-w-0", className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            render={
              <Link href={studioHref as Route} aria-label="Studio dashboard" />
            }
          >
            <Home className="size-3.5 shrink-0" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {crumbs.length === 0 ? (
            <BreadcrumbPage>Settings</BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              render={<Link href={"/settings/profile" as Route} />}
            >
              Settings
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {crumbs.length > 0 ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
