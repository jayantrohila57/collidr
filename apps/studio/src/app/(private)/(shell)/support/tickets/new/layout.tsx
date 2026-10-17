import type { Metadata } from "next";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "New ticket · Support",
  description: "Open a support ticket.",
};

export default async function NewSupportTicketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPageAction("support.ticket.create");
  return children;
}
