import { redirect } from "next/navigation";

export default async function ExportSettingsPage() {
  redirect("/settings?tab=export");
}
