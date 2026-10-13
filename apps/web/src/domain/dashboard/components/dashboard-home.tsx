"use client";

import { Plus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageStack, PageTitleRow } from "@/components/layout/app-layout";
import { EmptyState } from "@/components/patterns/empty-state";
import { ErrorState } from "@/components/patterns/error-state";
import { Button } from "@/components/ui/button";
import { CreateProjectSheet } from "@/domain/projects/components/create-project-sheet";
import { ProjectsTableView } from "@/domain/projects/components/projects-table-view";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { useDashboard } from "../hooks/use-dashboard";
import { DashboardStatRow } from "./dashboard-stat-row";
import { DashboardPageSkeleton } from "./skeletons";

export function DashboardHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const { projects, status, error, refetch } = useProjects();
  const {
    stats,
    status: overviewStatus,
    refetch: refetchOverview,
  } = useDashboard();

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5);
  }, [projects]);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
    }
  }, [searchParams]);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    if (searchParams.get("create") === "1") {
      router.replace("/dashboard");
    }
  }, [router, searchParams]);

  const openCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const isLoading = status === "loading" || overviewStatus === "loading";

  return (
    <>
      <PageStack>
        <PageTitleRow
          title="Dashboard"
          description="Workspace overview and recent projects."
          action={
            <Button type="button" size="sm" onClick={openCreate}>
              New project
            </Button>
          }
        />

        {isLoading ? (
          <DashboardPageSkeleton />
        ) : status === "error" ? (
          <ErrorState
            title="Failed to load projects"
            description={
              error?.message ??
              "We could not load your projects. Please try again."
            }
            onRetry={() => void refetch()}
          />
        ) : overviewStatus === "error" ? (
          <ErrorState
            title="Failed to load dashboard"
            description="We could not load your workspace overview."
            onRetry={() => void refetchOverview()}
          />
        ) : (
          <>
            {stats ? <DashboardStatRow stats={stats} /> : null}

            {status === "empty" ? (
              <EmptyState
                icon={Plus}
                title="No projects yet"
                description="Create a project to manage environment variables."
                actionLabel="New project"
                onAction={openCreate}
              />
            ) : (
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-medium text-sm">Recent projects</h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    render={<Link href={"/dashboard/projects" as Route} />}
                  >
                    View all
                  </Button>
                </div>
                <ProjectsTableView
                  projects={recentProjects}
                  caption="Recent projects"
                  captionSrOnly
                  emptyMessage="No projects yet"
                  searchable={false}
                  enablePagination={false}
                  limitRows={5}
                />
              </div>
            )}
          </>
        )}
      </PageStack>

      <CreateProjectSheet
        open={createOpen}
        onOpenChange={(next) => {
          if (next) setCreateOpen(true);
          else closeCreate();
        }}
      />
    </>
  );
}
