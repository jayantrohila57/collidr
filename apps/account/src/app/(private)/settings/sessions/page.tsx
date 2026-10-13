import { redirect } from "next/navigation";

export default async function SessionsSettingsPage() {
  redirect("/settings?tab=sessions");
}
