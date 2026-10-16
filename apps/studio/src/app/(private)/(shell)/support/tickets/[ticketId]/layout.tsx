import { guardSupportTicketPage } from "@/lib/page-guards";

export default async function SupportTicketDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  await guardSupportTicketPage(ticketId);
  return children;
}
