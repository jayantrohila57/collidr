import { redirect } from "next/navigation";

export default async function AccountsSettingsPage() {
  redirect("/dashboard/settings?tab=accounts");
}
