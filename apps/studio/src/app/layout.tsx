import { rootFontClassName } from "@loftlancer/ui/fonts";
import type { Metadata } from "next";

import "../index.css";
import Providers from "@/components/providers";
import { generateMetadata as generateSiteMetadata } from "@/lib/siteConfig";

export const metadata: Metadata = generateSiteMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={rootFontClassName}>
      <body className="relative antialiased">
        <div className="relative isolate flex min-h-svh min-w-0 flex-col">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
