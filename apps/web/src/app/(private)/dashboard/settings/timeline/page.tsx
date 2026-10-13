import { redirect } from "next/navigation";

export default function SettingsTimelinePage() {
  redirect("/dashboard/settings?tab=timeline");
}
