"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { consoleSignInUrl } from "@/lib/auth-url";
import { trpc } from "@/utils/trpc";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/organizations", label: "Organizations" },
  { href: "/dashboard/sessions", label: "Sessions" },
  { href: "/dashboard/audit", label: "Audit" },
] as const;

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = authClient.useSession();
  const access = useQuery({
    ...trpc.platform.accessStatus.queryOptions(),
    enabled: Boolean(session.data?.user),
    retry: false,
  });

  useEffect(() => {
    if (session.isPending) {
      return;
    }
    if (!session.data) {
      window.location.href = consoleSignInUrl();
    }
  }, [session.data, session.isPending]);

  useEffect(() => {
    if (access.isSuccess && access.data && !access.data.allowed) {
      router.replace("/forbidden");
    }
  }, [access.data, access.isSuccess, router]);

  if (session.isPending || !session.data) {
    return (
      <p className="p-6 text-muted-foreground text-sm">Checking session…</p>
    );
  }

  if (access.isPending) {
    return (
      <p className="p-6 text-muted-foreground text-sm">
        Verifying console access…
      </p>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-semibold text-sm">Env Manager Console</p>
            <p className="text-muted-foreground text-xs">
              Signed in as {session.data.user.email}
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
