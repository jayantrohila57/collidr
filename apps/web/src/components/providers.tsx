"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { OfflineBanner } from "@/components/patterns/offline-banner";
import { SkipLink } from "@/components/patterns/skip-link";
import { getClientErrorMessage } from "@/lib/errors/client-errors";
import { createTrpcClient, getQueryClient, TRPCProvider } from "@/utils/trpc";

import { ThemeProvider } from "./theme-provider";
import { DirectionProvider } from "./ui/direction";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());
  const [trpcClient] = useState(() => createTrpcClient());

  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      toast.error(
        getClientErrorMessage(event.reason, "An unexpected error occurred."),
      );
    };
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <DirectionProvider dir="ltr">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SkipLink />
            <OfflineBanner />
            {children}
            <ReactQueryDevtools />
            <Toaster richColors closeButton />
          </ThemeProvider>
        </DirectionProvider>
      </QueryClientProvider>
    </TRPCProvider>
  );
}
