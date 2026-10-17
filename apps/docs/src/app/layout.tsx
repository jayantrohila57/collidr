import { rootFontClassName } from "@loftlancer/ui/fonts";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../index.css";

export const metadata: Metadata = {
  title: {
    default: "Loftlancer Docs",
    template: "%s · Loftlancer Docs",
  },
  description:
    "Public documentation for Loftlancer — organizations, projects, environments, MCP, and API overview.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={rootFontClassName}>
      <body className="flex min-h-screen flex-col antialiased">
        <RootProvider search={{ enabled: false }}>{children}</RootProvider>
      </body>
    </html>
  );
}
