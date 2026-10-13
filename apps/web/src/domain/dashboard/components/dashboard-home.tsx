"use client";

import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/patterns/empty-state";
import { ErrorState } from "@/components/patterns/error-state";
import { Button } from "@/components/ui/button";
import { CreateProjectSheet } from "@/domain/projects/components/create-project-sheet";
import { ProjectsTableView } from "@/domain/projects/components/projects-table-view";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { pageStackClass } from "@/lib/page-layout";
import { useDashboard } from "../hooks/use-dashboard";
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
      <div className={pageStackClass}>
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-semibold text-lg tracking-tight">Dashboard</h1>
          <Button type="button" size="sm" onClick={openCreate}>
            New project
          </Button>
        </div>

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
            {stats ? (
              <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">Projects</dt>
                  <dd className="font-medium tabular-nums">
                    {stats.totalProjects}
                  </dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">Environments</dt>
                  <dd className="font-medium tabular-nums">
                    {stats.totalEnvironments}
                  </dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">Variables</dt>
                  <dd className="font-medium tabular-nums">
                    {stats.totalVariables}
                  </dd>
                </div>
              </dl>
            ) : null}

            {status === "empty" ? (
              <EmptyState
                icon={Plus}
                title="No projects yet"
                description="Create a project to manage environment variables."
                actionLabel="New project"
                onAction={openCreate}
              />
            ) : (
              <ProjectsTableView
                projects={projects}
                caption="Projects"
                emptyMessage="No projects yet"
              />
            )}
          </>
        )}
      </div>

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
