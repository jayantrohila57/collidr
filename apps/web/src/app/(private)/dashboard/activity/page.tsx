import { auth } from "@env-manager/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import AuditLogs from "@/domain/audit/components/audit-logs";

export const metadata: Metadata = {
  title: "Activity",
  description: "Organization audit log and recent changes.",
};

export default async function ActivityPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <DashboardSection
      title="Activity"
      description="Audit log of changes across your projects."
    >
      <AuditLogs />
    </DashboardSection>
  );
}
