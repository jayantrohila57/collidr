"use client";

import { ImpersonationBanner } from "@loftlancer/ui/patterns/impersonation-banner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { OfflineBanner } from "@/components/patterns/offline-banner";
import { SkipLink } from "@/components/patterns/skip-link";
import { DirectionProvider } from "@/components/ui/direction";
import { ToastProvider } from "@/components/ui/toast";
import {
  getClientErrorMessage,
  isBenignClientError,
} from "@/lib/errors/client-errors";
import { toast } from "@/lib/toast";
import { createTrpcClient, getQueryClient, TRPCProvider } from "@/utils/trpc";

import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());
  const [trpcClient] = useState(() => createTrpcClient());

  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isBenignClientError(event.reason)) {
        event.preventDefault();
        return;
      }
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
        <DirectionProvider direction="ltr">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider position="bottom-left">
              <SkipLink />
              <ImpersonationBanner />
              <OfflineBanner />
              {children}
              <ReactQueryDevtools />
            </ToastProvider>
          </ThemeProvider>
        </DirectionProvider>
      </QueryClientProvider>
    </TRPCProvider>
  );
}
