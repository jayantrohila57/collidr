import { redirect } from "next/navigation";

export default function DeleteSettingsPage() {
  redirect("/settings/danger");
}
