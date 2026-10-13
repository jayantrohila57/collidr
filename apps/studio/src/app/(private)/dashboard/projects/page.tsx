import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guardPageAction } from "@/lib/page-guards";
import { Suspense } from "react";
import { ProjectsPageClient } from "@/domain/projects/components/projects-page-client";
import { ProjectsSkeleton } from "@/domain/projects/components/skeletons";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Projects",
  description: `Manage your projects and environment variables in ${siteConfig.name}.`,
};

export default async function ProjectsPage() {
  await guardPageAction("project.read");
  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsPageClient />
    </Suspense>
  );
}
