import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";

export const metadata: Metadata = {
  title: "Sessions",
};

export default function SessionsSettingsPage() {
  if (!isActionsAuditEnabledOnServer()) {
    redirect("/dashboard/settings");
  }

  return (
    <DashboardSection
      title="Sessions"
      description="Review and revoke active sessions (Better Auth client wiring)."
    >
      <p className="text-muted-foreground text-sm">
        Session management UI connects to Better Auth list/revoke endpoints
        behind <code className="text-xs">session.*</code> actions.
      </p>
    </DashboardSection>
  );
}
