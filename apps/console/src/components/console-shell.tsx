"use client";

import { DashboardAppShell } from "@loftlancer/ui/app-shell";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ConsoleBreadcrumbs } from "@/components/console-breadcrumbs";
import { ConsoleSidebar } from "@/components/console-sidebar";
import { ConsoleUserMenu } from "@/domain/console/components/console-user-menu";
import Shell from "@/components/shell";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { consoleSignInUrl } from "@/lib/auth-url";
import { trpc } from "@/utils/trpc";

const shellComponents = {
  SidebarInset,
  SidebarTrigger,
  Separator,
};

export function ConsoleShell({ children }: { children: React.ReactNode }) {
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
    <Shell>
      <SidebarProvider>
        <TooltipProvider delay={0}>
          <DashboardAppShell
            components={shellComponents}
            sidebar={<ConsoleSidebar />}
            breadcrumbs={<ConsoleBreadcrumbs className="flex-nowrap" />}
            headerActions={<ConsoleUserMenu />}
          >
            {children}
          </DashboardAppShell>
        </TooltipProvider>
      </SidebarProvider>
    </Shell>
  );
}
