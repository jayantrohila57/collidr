"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DashboardSection from "@/components/section-dashboard";
import { CreateProjectSheet } from "./create-project-sheet";
import ProjectList from "./project-list";
import { ProjectsListStats } from "./projects-list-stats";

export function ProjectsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
    }
  }, [searchParams]);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    if (searchParams.get("create") === "1") {
      router.replace("/dashboard/projects");
    }
  }, [router, searchParams]);

  const openCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  return (
    <>
      <DashboardSection
        title="Projects"
        description="All workspace projects in one searchable list."
        stats={<ProjectsListStats />}
      >
        <ProjectList onCreateProject={openCreate} />
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
