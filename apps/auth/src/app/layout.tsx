import { rootFontClassName } from "@loftlancer/ui/fonts";
import type { Metadata } from "next";

import Providers from "@/components/providers";

import "../index.css";

export const metadata: Metadata = {
  title: "Sign in · Loftlancer",
  description: "Authentication for Loftlancer platform apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={rootFontClassName}>
      <body className="relative min-h-svh bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
