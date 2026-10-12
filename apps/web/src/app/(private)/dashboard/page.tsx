import { auth } from "@env-manager/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardStats from "@/components/dashboard-stats";
import DashboardSection from "@/components/section-dashboard";
import Shell from "@/components/shell";

const header = {
  title: "Dashboard",
  description: "Overview of your environment manager statistics",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <Shell>
      <Shell.Section variant="dashboard" padding="dashboard" scale="full">
        <DashboardSection {...header} showBack={false}>
          <DashboardStats />
        </DashboardSection>
      </Shell.Section>
    </Shell>
  );
}
