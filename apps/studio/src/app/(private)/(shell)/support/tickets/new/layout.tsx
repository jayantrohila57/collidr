import { guardPageAction } from "@/lib/page-guards";

export default async function NewSupportTicketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPageAction("support.ticket.create");
  return children;
}
