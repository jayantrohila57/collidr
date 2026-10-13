import { HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageStack, PageTitleRow } from "@/components/layout/app-layout";
import { StatCardRowSkeleton } from "@/components/patterns/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHome } from "@/domain/dashboard/components/dashboard-home";
import { DashboardPageSkeleton } from "@/domain/dashboard/components/skeletons";
import { loadDashboardPage } from "@/lib/dashboard-prefetch";

export default async function DashboardPage() {
  const { session, dehydratedState } = await loadDashboardPage();

  if (!session?.user) {
    redirect("/sign-in?redirect=%2Fdashboard");
  }

  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense
        fallback={
          <PageStack>
            <PageTitleRow
              title="Dashboard"
              description="Workspace overview and recent projects."
              back={false}
              action={
                <Skeleton className="size-8 rounded-md sm:h-8 sm:w-auto sm:min-w-[8.5rem]" />
              }
            />
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
