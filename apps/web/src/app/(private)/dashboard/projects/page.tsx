import { auth } from "@env-manager/auth";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { ProjectsSkeleton } from "@/domain/projects/components/skeletons";
import { siteConfig } from "@/lib/siteConfig";

const ProjectList = dynamic(
  () => import("@/domain/projects/components/project-list"),
  {
    loading: () => <ProjectsSkeleton />,
  },
);

export const metadata: Metadata = {
  title: "Projects",
  description: `Manage your projects and environment variables in ${siteConfig.name}.`,
};

const header = {
  title: "Projects",
  description: "Manage your projects and environment variables",
  actionLabel: "New Project",
  actionHref: "/dashboard/projects/new",
};

export default async function ProjectsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <DashboardSection {...header}>
      <ProjectList />
    </DashboardSection>
  );
}
