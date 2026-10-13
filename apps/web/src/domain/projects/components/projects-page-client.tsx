"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DashboardSection from "@/components/section-dashboard";
import { Button } from "@/components/ui/button";
import { CreateProjectSheet } from "./create-project-sheet";
import ProjectList from "./project-list";

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
        action={
          <Button type="button" size="sm" onClick={openCreate}>
            New project
          </Button>
        }
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
