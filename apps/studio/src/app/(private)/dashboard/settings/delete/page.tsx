import { redirect } from "next/navigation";

export default async function DeleteAccountSettingsPage() {
  redirect("/dashboard/settings?tab=delete");
}
