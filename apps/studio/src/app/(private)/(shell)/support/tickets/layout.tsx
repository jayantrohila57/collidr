import type { Metadata } from "next";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Support",
  description: "Your support tickets.",
};

export default async function SupportTicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPageAction("support.ticket.list");
  return children;
}
