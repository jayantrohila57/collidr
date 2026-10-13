import { redirect } from "next/navigation";

export default async function NewProjectPage() {
  redirect("/dashboard/projects?create=1");
}
