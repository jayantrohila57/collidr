import { redirect } from "next/navigation";

export default function AccountsSettingsPage() {
  redirect("/dashboard/settings?tab=accounts");
}
