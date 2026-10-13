import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { Providers } from "@/components/providers";

import "../index.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Env Manager Support",
  description: "Help center, support tickets, and legal information",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`font-sans ${inter.variable} ${geistMono.variable}`}
    >
      <body className="relative min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
