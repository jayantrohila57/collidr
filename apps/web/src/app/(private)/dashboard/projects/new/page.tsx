import { auth } from "@env-manager/auth";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { ProjectsSkeleton } from "@/domain/projects/components/skeletons";

const CreateProject = dynamic(
  async () =>
    import("@/domain/projects/components/project-create").then(
      (mod) => mod.CreateProject,
    ),
  {
    loading: () => <ProjectsSkeleton />,
  },
);

export const metadata: Metadata = {
  title: "Create New Project",
  description: "Add a new project to organize your environment variables.",
};

const header = {
  title: "Create New Project",
  description: "Add a new project to organize your environment variables.",
};

export default async function NewProjectPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <DashboardSection {...header}>
      <CreateProject />
    </DashboardSection>
  );
}
