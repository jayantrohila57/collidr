import { redirect } from "next/navigation";

export default async function DeleteAccountSettingsPage() {
  redirect("/settings?tab=delete");
}
