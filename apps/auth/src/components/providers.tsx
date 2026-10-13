"use client";

import { ImpersonationBanner } from "@env-manager/ui/patterns/impersonation-banner";
import { ThemeProvider } from "@env-manager/ui/theme-provider";
import { authClient } from "@/lib/auth-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ImpersonationBanner
        impersonatedByUserId={
          (session?.session as { impersonatedBy?: string } | undefined)
            ?.impersonatedBy ?? null
        }
      />
      {children}
    </ThemeProvider>
  );
}
