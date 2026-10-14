"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard/support/tickets" as Route, label: "Ticket queue" },
  { href: "/dashboard/support/faq" as Route, label: "FAQ articles" },
] as const;

export function SupportManagerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="font-semibold text-sm">Collidr Support (manager)</p>
          <nav className="flex flex-wrap gap-2 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname.startsWith(item.href)
                    ? "rounded-md bg-muted px-2 py-1 font-medium"
                    : "rounded-md px-2 py-1 hover:bg-muted"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
