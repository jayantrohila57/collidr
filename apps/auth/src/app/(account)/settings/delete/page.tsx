import type { Route } from "next";
import { redirect } from "next/navigation";

export default function DeleteSettingsPage() {
  redirect("/settings/danger" as Route);
}
