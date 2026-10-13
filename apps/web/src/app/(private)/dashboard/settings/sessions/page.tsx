import { redirect } from "next/navigation";

export default function SessionsSettingsPage() {
  redirect("/dashboard/settings?tab=sessions");
}
