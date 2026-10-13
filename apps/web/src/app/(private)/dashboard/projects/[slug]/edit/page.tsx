import { redirect } from "next/navigation";

interface EditProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { slug } = await params;
  redirect(`/dashboard/projects/${slug}?edit=1`);
}
