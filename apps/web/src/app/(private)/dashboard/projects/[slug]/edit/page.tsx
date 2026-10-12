import { auth } from "@env-manager/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { deSlug } from "@/lib/utils";
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
  const projectTitle = deSlug(slug);

  return {
    title: `Edit ${projectTitle}`,
    description: `Edit project details for ${projectTitle}.`,
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
