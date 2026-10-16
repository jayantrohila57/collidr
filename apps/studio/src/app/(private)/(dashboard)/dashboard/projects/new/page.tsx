import { redirect } from "next/navigation";
import { guardPageAction } from "@/lib/page-guards";

export default async function NewProjectPage() {
  await guardPageAction("project.create");
  redirect("/dashboard/projects?create=1");
}
