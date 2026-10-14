import { AccountDashboardShell } from "@/components/layout/account-dashboard-shell";
import { guardAuthenticatedPage } from "@/lib/page-guards";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardAuthenticatedPage();
  return <AccountDashboardShell>{children}</AccountDashboardShell>;
}
