import type { Metadata } from "next";
import { guardSupportTicketPage } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Ticket · Support",
  description: "Support ticket conversation.",
};

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
