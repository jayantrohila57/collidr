"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { AppGlyph } from "@/domain/apps/components/app-glyph";
import { useProjectApps } from "@/domain/apps/hooks/use-project-apps";

/** Installed apps nested under the active project (apps system, #245). */
export function SidebarProjectApps({ slug }: { slug: string }) {
  const pathname = usePathname();
  const { installed, canManage, isLoading } = useProjectApps(slug);
  if (isLoading) return null;
  const items = [
    ...installed.map((a) => ({
      key: a.id,
      label: a.name,
      icon: a.icon,
      href: `/p/${slug}/${a.nav[0]?.path ?? a.id}`,
    })),
    ...(canManage
      ? [
          {
            key: "apps",
            label: "Apps",
            icon: "LayoutGrid",
            href: `/p/${slug}/apps`,
          },
        ]
      : []),
  ];
  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem
          key={item.key}
          className="ps-4 group-data-[collapsible=icon]:hidden"
        >
          <SidebarMenuButton
            size="sm"
            isActive={
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            }
            render={<Link href={item.href as Route} />}
          >
            <AppGlyph
              icon={item.icon}
              className="size-5 rounded-md border-0 bg-transparent"
            />
            <span className="truncate">{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
