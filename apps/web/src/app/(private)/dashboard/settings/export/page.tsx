import { redirect } from "next/navigation";

export default function ExportSettingsPage() {
  redirect("/dashboard/settings?tab=export");
}
