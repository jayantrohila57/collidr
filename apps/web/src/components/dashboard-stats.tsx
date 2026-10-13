"use client";

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
import { ErrorState } from "@/components/patterns/error-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
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
  variant?: "default" | "secondary";
  href?: string;
}

function StatCard({ title, value, icon, description, href }: StatCardProps) {
  const cardContent = (
    <Card
      className={
        href ? "cursor-pointer transition-colors hover:bg-accent/50" : ""
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <CardAction>{icon}</CardAction>
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {description && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href as Route}>{cardContent}</Link>;
  }

  return cardContent;
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
      <div className="min-w-0 rounded-lg border bg-card p-4 md:p-6">
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
            <div className="min-w-0">
              <h1 className="font-bold text-lg leading-tight sm:text-2xl">
                Welcome back, {user?.name || user?.email || "User"}!
              </h1>
              <p className="wrap-anywhere text-muted-foreground text-sm">
                Here's what's happening with your projects today
              </p>
            </div>
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
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<FolderOpen className="h-6 w-6 text-muted-foreground" />}
          description={`${stats.activeProjects} active`}
          variant="secondary"
          href="/dashboard/projects"
        />
        <StatCard
          title="Total Environments"
          value={stats.totalEnvironments}
          icon={<Server className="h-6 w-6 text-muted-foreground" />}
          description={`${stats.activeEnvironments} active`}
          variant="secondary"
          href="/dashboard/projects"
        />
        <StatCard
          title="Environment Variables"
          value={stats.totalVariables}
          icon={<Key className="h-6 w-6 text-muted-foreground" />}
          description="Across all environments"
          variant="secondary"
          href="/dashboard/projects"
        />
        <StatCard
          title="Production Environments"
          value={stats.productionEnvironments}
          icon={<Factory className="h-6 w-6 text-muted-foreground" />}
          description="Live environments"
          variant="secondary"
          href="/dashboard/projects"
        />
        <StatCard
          title="Recent Activity"
          value={stats.recentAuditLogs}
          icon={<Activity className="h-6 w-6 text-muted-foreground" />}
          description="Last 7 days"
          variant="secondary"
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
          variant="secondary"
        />
      </div>

      {activity && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.recentProjects.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No projects yet
                  </p>
                ) : (
                  activity.recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {project.slug}
                        </p>
                      </div>
                      <div className="text-end">
                        <Badge
                          variant={
                            project.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {project.status}
                        </Badge>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(project.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
