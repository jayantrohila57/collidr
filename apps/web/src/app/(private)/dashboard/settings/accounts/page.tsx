import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";

export const metadata: Metadata = {
  title: "Connected accounts",
};

export default function AccountsSettingsPage() {
  if (!isActionsAuditEnabledOnServer()) {
    redirect("/dashboard/settings");
  }

  return (
    <DashboardSection
      title="Connected accounts"
      description="Link or unlink OAuth providers."
    >
      <p className="text-muted-foreground text-sm">
        Provider list uses <code className="text-xs">account.list</code> and
        link/unlink actions.
      </p>
    </DashboardSection>
  );
}
