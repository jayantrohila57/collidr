import { guardSupportManagerPage } from "@/lib/page-guards";

export default async function SupportManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardSupportManagerPage();
  return children;
}
