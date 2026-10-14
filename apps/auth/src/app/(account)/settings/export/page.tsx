import type { Route } from "next";
import { redirect } from "next/navigation";

export default function ExportSettingsPage() {
  redirect("/settings/danger" as Route);
}
