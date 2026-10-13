import { redirect } from "next/navigation";

export default function DeleteAccountSettingsPage() {
  redirect("/dashboard/settings?tab=delete");
}
