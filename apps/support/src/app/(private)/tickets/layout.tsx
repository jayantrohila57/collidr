import { guardPageAction } from "@/lib/page-guards";

export default async function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPageAction("support.ticket.list");
  return children;
}
