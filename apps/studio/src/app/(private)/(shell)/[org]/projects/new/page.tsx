import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectsPageClient } from "@/domain/projects/components/projects-page-client";
import { ProjectsPageSkeleton } from "@/domain/projects/components/skeletons";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = { title: "New project" };

/** /[org]/projects/new — the project list with the create sheet open. */
export default async function NewProjectPage() {
  await guardPageAction("project.create");
  return (
    <Suspense fallback={<ProjectsPageSkeleton />}>
      <ProjectsPageClient createRoute />
    </Suspense>
  );
}
