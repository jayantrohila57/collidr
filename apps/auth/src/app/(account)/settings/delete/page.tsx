import type { Route } from "next";
import { redirect } from "next/navigation";

export default async function DeleteSettingsPage() {
  redirect("/settings/danger" as Route);
}
