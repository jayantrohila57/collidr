import { redirect } from "next/navigation";

export default async function SessionsSettingsPage() {
  redirect("/dashboard/settings?tab=sessions");
}
