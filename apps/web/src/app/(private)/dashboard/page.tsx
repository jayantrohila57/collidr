import { auth } from "@env-manager/auth";
import { HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardStats from "@/components/dashboard-stats";
import DashboardSection from "@/components/section-dashboard";
import Shell from "@/components/shell";
import { dehydrateDashboardOverview } from "@/lib/dashboard-prefetch";

const header = {
  title: "Dashboard",
  description: "Overview of your environment manager statistics",
};

export default async function DashboardPage() {
  const headerList = await headers();
  const session = await auth.api.getSession({
    headers: headerList,
  });

  if (!session?.user) {
    redirect("/");
  }

  const dehydratedState = await dehydrateDashboardOverview(headerList);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Shell>
        <Shell.Section variant="dashboard" padding="dashboard" scale="full">
          <DashboardSection {...header} showBack={false}>
            <DashboardStats />
          </DashboardSection>
        </Shell.Section>
      </Shell>
    </HydrationBoundary>
  );
}
