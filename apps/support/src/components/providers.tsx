"use client";

import { LoftlancerImpersonationBanner } from "@loftlancer/auth-client";
import { ThemeProvider } from "@loftlancer/ui/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { createTrpcClient, getQueryClient, TRPCProvider } from "@/utils/trpc";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());
  const [trpcClient] = useState(() => createTrpcClient());

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoftlancerImpersonationBanner authClient={authClient} />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </TRPCProvider>
  );
}
