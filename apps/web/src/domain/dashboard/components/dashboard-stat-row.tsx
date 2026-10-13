"use client";

import type { Route } from "next";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

type DashboardStats = {
  totalProjects: number;
  totalEnvironments: number;
  totalVariables: number;
};

export function DashboardStatRow({ stats }: { stats: DashboardStats }) {
  const items = [
    {
      label: "Projects",
      value: stats.totalProjects,
      href: "/dashboard/projects" as Route,
      hint: "View all projects",
    },
    {
      label: "Environments",
      value: stats.totalEnvironments,
      href: "/dashboard/projects" as Route,
      hint: "Across all projects",
    },
    {
      label: "Variables",
      value: stats.totalVariables,
      href: "/dashboard/activity" as Route,
      hint: "Across all environments",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3", layoutGapClass)}>
      {items.map((item) => (
        <Link key={item.label} href={item.href} className="min-w-0">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader className="pb-1">
              <CardDescription>{item.label}</CardDescription>
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
