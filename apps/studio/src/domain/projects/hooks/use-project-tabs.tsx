"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { PageHeaderTab } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectApps } from "@/domain/apps/hooks/use-project-apps";

import { routes } from "@/utils/navigation";
import { useOrgSlug } from "@/utils/use-route-scope";

/** Widths of "Environments" and "Tasks" tab labels. */
const APP_TAB_PLACEHOLDERS = ["w-[5.75rem]", "w-[2.25rem]"];

/** Link tabs for every project page: Overview, installed app pages, Apps. */
export function useProjectTabs(slug: string) {
  const org = useOrgSlug();
  const pathname = usePathname() ?? "";
  const { installed, isLoading } = useProjectApps(slug);
  const base = routes.project(org, slug);

  const tabs = useMemo<PageHeaderTab[]>(
    () => [
      { value: "overview", label: "Overview", href: base },
      // Reserve the app-tab slots while installs load so tabs don't slide.
      ...(isLoading
        ? APP_TAB_PLACEHOLDERS.map((w, i) => ({
            value: `__loading-${String(i)}`,
            label: <Skeleton className={`h-3 ${w}`} />,
            disabled: true,
          }))
        : []),
      ...installed.flatMap((app) =>
        app.nav.map((n) => ({
          value: n.path,
          label: n.label,
          href: `${base}/${n.path}`,
        })),
      ),
      { value: "apps", label: "Apps", href: `${base}/apps` },
    ],
    [base, installed, isLoading],
  );

  const rest = pathname.startsWith(base)
    ? pathname.slice(base.length).split("/").filter(Boolean)
    : [];
  const activeTab = rest[0] ?? "overview";
  return { tabs, activeTab };
}
