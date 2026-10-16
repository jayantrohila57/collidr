"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { PageHeaderTab } from "@/components/layout/page-header";
import { useProjectApps } from "@/domain/apps/hooks/use-project-apps";

/** Link tabs for every project page: Overview, installed app pages, Apps. */
export function useProjectTabs(slug: string) {
  const pathname = usePathname() ?? "";
  const { installed } = useProjectApps(slug);
  const base = `/p/${slug}`;

  const tabs = useMemo<PageHeaderTab[]>(
    () => [
      { value: "overview", label: "Overview", href: base },
      ...installed.flatMap((app) =>
        app.nav.map((n) => ({
          value: n.path,
          label: n.label,
          href: `${base}/${n.path}`,
        })),
      ),
      { value: "apps", label: "Apps", href: `${base}/apps` },
    ],
    [base, installed],
  );

  const rest = pathname.startsWith(base)
    ? pathname.slice(base.length).split("/").filter(Boolean)
    : [];
  const activeTab = rest[0] ?? "overview";
  return { tabs, activeTab };
}
