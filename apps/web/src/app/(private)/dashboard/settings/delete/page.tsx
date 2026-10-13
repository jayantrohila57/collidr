import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";

export const metadata: Metadata = {
  title: "Delete account",
};

export default function DeleteAccountSettingsPage() {
  if (!isActionsAuditEnabledOnServer()) {
    redirect("/dashboard/settings");
  }

  return (
    <DashboardSection
      title="Delete account"
      description="Remove your account after confirming you are not the sole organization owner."
    >
      <p className="text-muted-foreground text-sm">
        Deletion flows through <code className="text-xs">account.delete</code>{" "}
        with typed confirmation.
      </p>
    </DashboardSection>
  );
}
