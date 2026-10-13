import { guardPageAction } from "@/lib/page-guards";

export default async function NewTicketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPageAction("support.ticket.create");
  return children;
}
