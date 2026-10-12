import { auth } from "@env-manager/auth";
import { getOwnedProjectBySlug } from "@env-manager/db";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import EditProjectClient from "./edit-project-client";

interface EditProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: EditProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      title: "Edit project",
      description: "Edit project details.",
    };
  }

  const projectRecord = await getOwnedProjectBySlug(session.user.id, slug);

  if (!projectRecord) {
    return {
      title: "Edit project",
      description: "Edit project details.",
    };
  }

  return {
    title: `Edit ${projectRecord.name}`,
    description: `Edit project details for ${projectRecord.name}.`,
  };
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { slug } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return <EditProjectClient slug={slug} />;
}
