"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageHeaderActionButton } from "@/components/layout/app-layout";
import DashboardSection from "@/components/section-dashboard";
import { Can } from "@/domain/permissions/components/can";
import { routes } from "@/utils/navigation";
import { useOrgSlug } from "@/utils/use-route-scope";
import { useProjects } from "../hooks/use-projects";
import { CreateProjectSheet } from "./create-project-sheet";
import ProjectList from "./project-list";
import { ProjectsListStats } from "./projects-list-stats";

export function ProjectsPageClient({
  createRoute = false,
}: {
  /** Rendered at /[org]/projects/new: sheet open, closing returns to the list. */
  createRoute?: boolean;
} = {}) {
  const org = useOrgSlug();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(createRoute);
  const projectsList = useProjects();

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
    }
  }, [searchParams]);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    if (createRoute || searchParams.get("create") === "1") {
      router.replace(routes.projects(org));
    }
  }, [createRoute, org, router, searchParams]);

  const openCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  return (
    <>
      <DashboardSection
        title="Projects"
        description="All workspace projects in one searchable list."
        back={false}
        action={
          <Can action="project.create">
            <PageHeaderActionButton label="New project" onClick={openCreate} />
          </Can>
        }
        stats={<ProjectsListStats list={projectsList} />}
      >
        <ProjectList list={projectsList} onCreateProject={openCreate} />
      </DashboardSection>
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
