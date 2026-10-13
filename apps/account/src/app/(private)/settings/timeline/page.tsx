import { redirect } from "next/navigation";

export default function SettingsTimelinePage() {
  redirect("/settings?tab=timeline");
}
