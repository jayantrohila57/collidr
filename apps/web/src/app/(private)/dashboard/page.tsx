import { HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageStack, PageTitleRow } from "@/components/layout/app-layout";
import { StatCardRowSkeleton } from "@/components/patterns/stat-card";
import { DashboardHome } from "@/domain/dashboard/components/dashboard-home";
import { DashboardPageSkeleton } from "@/domain/dashboard/components/skeletons";
import { loadDashboardPage } from "@/lib/dashboard-prefetch";

export default async function DashboardPage() {
  const { session, dehydratedState } = await loadDashboardPage();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense
        fallback={
          <PageStack>
            <PageTitleRow title="Dashboard" />
            <StatCardRowSkeleton count={4} />
            <DashboardPageSkeleton />
          </PageStack>
        }
      >
        <DashboardHome />
      </Suspense>
    </HydrationBoundary>
  );
}
