import { guardPageAction } from "@/lib/page-guards";

export default async function SupportTicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPageAction("support.ticket.list");
  return children;
}
