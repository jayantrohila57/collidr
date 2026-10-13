import { redirect } from "next/navigation";

export default async function ExportSettingsPage() {
  redirect("/dashboard/settings?tab=export");
}
