import { HydrationBoundary } from "@tanstack/react-query";
import { PrivateDashboardShell } from "@/components/layout/private-dashboard-shell";
import { guardAuthenticatedPage } from "@/lib/page-guards";
import { dehydrateStudioShellQueries } from "@/lib/shell-prefetch";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await guardAuthenticatedPage();
  const dehydratedState = await dehydrateStudioShellQueries(session);

  return (
    <HydrationBoundary state={dehydratedState}>
      <PrivateDashboardShell>{children}</PrivateDashboardShell>
    </HydrationBoundary>
  );
}
