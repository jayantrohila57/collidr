"use client";

import {
  type LegacyColumnDef,
  legacyCreateColumnHelper,
} from "@tanstack/react-table/legacy";
import {
  Activity,
  Factory,
  FolderOpen,
  Key,
  Server,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { ErrorState } from "@/components/patterns/error-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   PolarAngleAxis,
//   PolarGrid,
//   Radar,
//   RadarChart,
// } from "recharts";
import type {
  // ChartContainer,
  // ChartTooltip,
  // ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Frame, FrameHeader, FrameTitle } from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { DashboardPageSkeleton } from "@/domain/dashboard/components/skeletons";
import { useDashboard } from "@/domain/dashboard/hooks/use-dashboard";
import { formatDate } from "@/lib/format";
import { Separator } from "./ui/separator";

const _chartConfig = {
  projects: {
    label: "Projects",
    color: "var(--chart-1)",
  },
  environments: {
    label: "Environments",
    color: "var(--chart-2)",
  },
  active: {
    label: "Active",
    color: "var(--chart-3)",
  },
  inactive: {
    label: "Inactive",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  description?: string;
  href?: string;
}

type RecentProjectRow = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive" | "maintenance";
  createdAt: string;
};

const recentProjectColumnHelper = legacyCreateColumnHelper<RecentProjectRow>();
const recentProjectColumns = [
  recentProjectColumnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
  }),
  recentProjectColumnHelper.accessor("slug", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
  }),
  recentProjectColumnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => (
      <Badge variant={getValue() === "active" ? "default" : "secondary"}>
        {getValue()}
      </Badge>
    ),
  }),
  recentProjectColumnHelper.accessor("createdAt", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ getValue }) => formatDate(String(getValue())),
  }),
] as LegacyColumnDef<RecentProjectRow, unknown>[];

function StatCard({ title, value, icon, description, href }: StatCardProps) {
  const body = (
    <>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>{icon}</CardAction>
      </CardHeader>
      <CardPanel>
        <div className="font-bold text-2xl">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </CardPanel>
    </>
  );

  if (href) {
    return <Card render={<Link href={href as Route} />}>{body}</Card>;
  }

  return <Card>{body}</Card>;
}

function _ChartSkeleton() {
  return (
    <div className="flex h-[300px] items-center justify-center">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

export default function DashboardStats() {
  const { stats, activity, isLoading, status, refetch } = useDashboard();
  const { data: session } = useSession();
  const user = session?.user;

  if (isLoading) {
    return <DashboardPageSkeleton />;
  }

  if (status === "error") {
    return (
      <ErrorState
        title="Failed to load dashboard"
        description="We could not load your statistics."
        onRetry={() => refetch()}
      />
    );
  }

  if (!stats) {
    return (
      <ErrorState
        title="No dashboard data"
        description="Try refreshing the page."
        onRetry={() => refetch()}
      />
    );
  }

  // const projectsStatusData = Object.entries(stats.projectsByStatus).map(([status, count]) => ({
  //   name: status.charAt(0).toUpperCase() + status.slice(1),
  //   value: count,
  // }));

  // const environmentsStatusData = Object.entries(stats.environmentsByStatus).map(([status, count]) => ({
  //   name: status.charAt(0).toUpperCase() + status.slice(1),
  //   value: count,
  // }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Welcome back, {user?.name || user?.email || "User"}!
          </CardTitle>
          <CardDescription>
            Here&apos;s what&apos;s happening with your projects today
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Avatar className="size-14 shrink-0 border-2 sm:size-20">
                <AvatarImage
                  src={user?.image || undefined}
                  alt={user?.name || "User"}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
              <Badge
                variant="secondary"
                className="flex max-w-full items-center gap-1"
              >
                <Sparkles className="h-3 w-3 shrink-0" />
                <span className="truncate">{stats.totalProjects} Projects</span>
              </Badge>
              <Badge
                variant="outline"
                className="flex max-w-full items-center gap-1"
              >
                <TrendingUp className="h-3 w-3 shrink-0" />
                <span className="truncate">{stats.activeProjects} Active</span>
              </Badge>
            </div>
          </div>
        </CardPanel>
      </Card>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<FolderOpen className="h-6 w-6 text-muted-foreground" />}
          description={`${stats.activeProjects} active`}
          href="/dashboard/projects"
        />
        <StatCard
          title="Total Environments"
          value={stats.totalEnvironments}
          icon={<Server className="h-6 w-6 text-muted-foreground" />}
          description={`${stats.activeEnvironments} active`}
          href="/dashboard/projects"
        />
        <StatCard
          title="Environment Variables"
          value={stats.totalVariables}
          icon={<Key className="h-6 w-6 text-muted-foreground" />}
          description="Across all environments"
          href="/dashboard/projects"
        />
        <StatCard
          title="Production Environments"
          value={stats.productionEnvironments}
          icon={<Factory className="h-6 w-6 text-muted-foreground" />}
          description="Live environments"
          href="/dashboard/projects"
        />
        <StatCard
          title="Recent Activity"
          value={stats.recentAuditLogs}
          icon={<Activity className="h-6 w-6 text-muted-foreground" />}
          description="Last 7 days"
        />
        <StatCard
          title="Active Rate"
          value={
            stats.totalProjects > 0
              ? `${Math.round(
                  (stats.activeProjects / stats.totalProjects) * 100,
                )}%`
              : "0%"
          }
          icon={<Activity className="h-6 w-6 text-muted-foreground" />}
          description="Share of projects marked active"
        />
      </div>

      {activity && (
        <Frame className="w-full">
          <FrameHeader>
            <FrameTitle>Recent Projects</FrameTitle>
          </FrameHeader>
          <DataTable
            columns={recentProjectColumns}
            data={activity.recentProjects}
            emptyMessage="No projects yet"
            caption="Recently created projects"
          />
        </Frame>
      )}
    </div>
  );
}
