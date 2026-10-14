"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ADMIN_NAV_GROUPS,
  isAdminNavItemActive,
} from "@/domain/console/admin-nav";
import { authClient } from "@/lib/auth-client";
import { consoleSignInUrl } from "@/lib/auth-url";
import { trpc } from "@/utils/trpc";

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = authClient.useSession();
  const access = useQuery({
    ...trpc.platform.accessStatus.queryOptions(),
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
    if (!access.isSuccess || !access.data) {
      return;
    }
    if (access.data.needsSignIn) {
      window.location.href = consoleSignInUrl();
      return;
    }
    if (!access.data.allowed) {
      router.replace("/forbidden");
    }
  }, [access.data, access.isSuccess, router]);

  if (session.isPending || !session.data) {
    return (
      <p className="p-6 text-muted-foreground text-sm">Checking session…</p>
    );
  }

  if (
    access.isPending ||
    (access.isSuccess && access.data?.needsSignIn)
  ) {
    return (
      <p className="p-6 text-muted-foreground text-sm">
        Verifying console access…
      </p>
    );
  }

  if (access.isSuccess && access.data && !access.data.allowed) {
    return (
      <p className="p-6 text-muted-foreground text-sm">Redirecting…</p>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-semibold text-sm">Collidr Console</p>
            <p className="text-muted-foreground text-xs">
              Signed in as {session.data.user.email}
            </p>
          </div>
          <nav className="flex max-w-3xl flex-col gap-2 text-sm">
            {ADMIN_NAV_GROUPS.map((group) => (
              <div
                key={group.label}
                className="flex flex-wrap items-center gap-1.5"
              >
                <span className="shrink-0 px-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  {group.label}
                </span>
                {group.items.map((item) => {
                  const active = isAdminNavItemActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={
                        active
                          ? "rounded-md bg-muted px-2 py-1 font-medium"
                          : "rounded-md px-2 py-1 hover:bg-muted"
                      }
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
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
