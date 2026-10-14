import { SupportManagerShell } from "@/components/support-manager-shell";
import { guardSupportManagerPage } from "@/lib/page-guards";

export default async function SupportManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardSupportManagerPage();
  return <SupportManagerShell>{children}</SupportManagerShell>;
}
