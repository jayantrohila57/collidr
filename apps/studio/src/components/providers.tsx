"use client";

import { DirectionProvider } from "@loftlancer/ui/direction";
import { ImpersonationBanner } from "@loftlancer/ui/patterns/impersonation-banner";
import { OfflineBanner } from "@loftlancer/ui/patterns/offline-banner";
import { SkipLink } from "@loftlancer/ui/patterns/skip-link";
import { ThemeProvider } from "@loftlancer/ui/theme-provider";
import { ToastProvider } from "@loftlancer/ui/toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { SentryUser } from "@/components/sentry-user";
import {
  getClientErrorMessage,
  isBenignClientError,
} from "@/lib/errors/client-errors";
import { toast } from "@/lib/toast";
import { createTrpcClient, getQueryClient, TRPCProvider } from "@/utils/trpc";

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
              {/* Sentry stays off without a DSN (#339); skip the session hook too. */}
              {process.env.NEXT_PUBLIC_SENTRY_DSN ? <SentryUser /> : null}
              {children}
              <ReactQueryDevtools />
            </ToastProvider>
          </ThemeProvider>
        </DirectionProvider>
      </QueryClientProvider>
    </TRPCProvider>
  );
}
