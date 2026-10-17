import type { Route } from "next";
import { redirect } from "next/navigation";

export default async function ExportSettingsPage() {
  redirect("/settings/danger" as Route);
}
