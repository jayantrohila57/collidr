import type { Route } from "next";
import { redirect } from "next/navigation";

export default async function SettingsIndexPage() {
  redirect("/settings/profile" as Route);
}
