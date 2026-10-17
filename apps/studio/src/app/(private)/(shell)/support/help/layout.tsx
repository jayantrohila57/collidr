import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help center · Support",
  description: "Answers to common questions.",
};

export default function SupportHelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
