"use client";

import type { SupportAppRouter } from "@collidr/api/routers/support-app";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import {
  createTRPCContext,
  createTRPCOptionsProxy,
} from "@trpc/tanstack-react-query";

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

const t = createTRPCContext<SupportAppRouter>();

export const TRPCProvider = t.TRPCProvider;
export const useTRPC = t.useTRPC;

export function createTrpcClient() {
  return createTRPCClient<SupportAppRouter>({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  });
}

export const queryClient = getQueryClient();
export const trpcClient = createTrpcClient();

export const trpc = createTRPCOptionsProxy<SupportAppRouter>({
  client: trpcClient,
  queryClient,
});
