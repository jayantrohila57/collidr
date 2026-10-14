import { requirePageAction, runPageGuard } from "@collidr/api/page-guards";
import { guardSupportManagerPage } from "@/lib/page-guards";

export default async function SupportFaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await guardSupportManagerPage();
  await runPageGuard(() =>
    requirePageAction("support.faq.read", { userId: session.user.id }),
  );
  return children;
}
