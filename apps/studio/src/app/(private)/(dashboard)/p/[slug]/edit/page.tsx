import type { Route } from "next";
import { redirect } from "next/navigation";
import { guardProjectEditPage } from "@/lib/page-guards";

interface EditProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { slug } = await params;
  await guardProjectEditPage(slug);
  redirect(`/p/${slug}?edit=1` as Route);
}
