"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { supportSignInUrl } from "@/lib/auth-url";

const publicNav = [
  { href: "/help", label: "Help center" },
  { href: "/legal/terms", label: "Legal" },
] as const;

export function SupportShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const session = authClient.useSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="font-semibold text-sm">
            Env Manager Support
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {publicNav.map((item) => (
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
            {session.data?.user ? (
              <>
                <Link
                  href="/tickets"
                  className="rounded-md px-2 py-1 hover:bg-muted"
                >
                  My tickets
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => authClient.signOut()}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  window.location.href = supportSignInUrl();
                }}
              >
                Sign in
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
