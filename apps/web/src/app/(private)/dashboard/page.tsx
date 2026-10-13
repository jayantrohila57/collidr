import { auth } from "@env-manager/auth";
import { HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageStack, PageTitleRow } from "@/components/layout/app-layout";
import { StatCardRowSkeleton } from "@/components/patterns/stat-card";
import { DashboardHome } from "@/domain/dashboard/components/dashboard-home";
import { DashboardPageSkeleton } from "@/domain/dashboard/components/skeletons";
import { dehydrateDashboardOverview } from "@/lib/dashboard-prefetch";

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
