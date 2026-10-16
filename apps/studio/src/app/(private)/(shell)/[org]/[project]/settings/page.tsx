import type { Metadata } from "next";
import { guardProjectEditPage } from "@/lib/page-guards";
import EditProjectClient from "./edit-project-client";

export const metadata: Metadata = {
  title: "Project settings",
  description: "Update project information and settings.",
};

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ org: string; project: string }>;
}) {
  const { project: slug } = await params;
  await guardProjectEditPage(slug);
  return <EditProjectClient slug={slug} />;
}
