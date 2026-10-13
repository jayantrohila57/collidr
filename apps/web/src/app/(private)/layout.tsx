import { PrivateDashboardShell } from "@/components/layout/private-dashboard-shell";
import { guardAuthenticatedPage } from "@/lib/page-guards";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardAuthenticatedPage();
  return <PrivateDashboardShell>{children}</PrivateDashboardShell>;
}
