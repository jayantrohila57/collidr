"use client";

import type { Route } from "next";
import Link from "next/link";
import { AppIcon } from "@/components/patterns/app-icon";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import type { AppIconName } from "@/lib/icons";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

type DashboardStats = {
  totalProjects: number;
  totalEnvironments: number;
  totalVariables: number;
};

export function DashboardStatRow({ stats }: { stats: DashboardStats }) {
  const items: {
    label: string;
    value: number;
    href: Route;
    hint: string;
    icon: AppIconName;
  }[] = [
    {
      label: "Projects",
      value: stats.totalProjects,
      href: "/dashboard/projects",
      hint: "View all projects",
      icon: "project",
    },
    {
      label: "Environments",
      value: stats.totalEnvironments,
      href: "/dashboard/projects",
      hint: "Across all projects",
      icon: "environment",
    },
    {
      label: "Variables",
      value: stats.totalVariables,
      href: "/dashboard/activity",
      hint: "Across all environments",
      icon: "variable",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3", layoutGapClass)}>
      {items.map((item) => (
        <Link key={item.label} href={item.href} className="min-w-0">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader className="pb-1">
              <div className="flex items-start justify-between gap-2">
                <CardDescription>{item.label}</CardDescription>
                <AppIcon name={item.icon} />
              </div>
              <CardTitle className="text-2xl tabular-nums">
                {item.value}
              </CardTitle>
            </CardHeader>
            <CardPanel className="pt-0 text-muted-foreground text-xs">
              {item.hint}
            </CardPanel>
          </Card>
        </Link>
      ))}
    </div>
  );
}
