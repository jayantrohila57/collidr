import { auth } from "@env-manager/auth";
import { HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardHome } from "@/domain/dashboard/components/dashboard-home";
import { DashboardPageSkeleton } from "@/domain/dashboard/components/skeletons";
import { dehydrateDashboardOverview } from "@/lib/dashboard-prefetch";
import { pageStackClass } from "@/lib/page-layout";

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
          <div className={pageStackClass}>
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-semibold text-lg tracking-tight">
                Dashboard
              </h1>
            </div>
            <DashboardPageSkeleton />
          </div>
        }
      >
        <DashboardHome />
      </Suspense>
    </HydrationBoundary>
  );
}
