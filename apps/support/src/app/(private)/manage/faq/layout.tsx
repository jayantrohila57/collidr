import { guardPageAction } from "@/lib/page-guards";

export default async function ManageFaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPageAction("support.faq.read");
  return children;
}
