import { auth } from "@env-manager/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ProjectsPageClient } from "@/domain/projects/components/projects-page-client";
import { ProjectsSkeleton } from "@/domain/projects/components/skeletons";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Projects",
  description: `Manage your projects and environment variables in ${siteConfig.name}.`,
};

export default async function ProjectsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsPageClient />
    </Suspense>
  );
}
