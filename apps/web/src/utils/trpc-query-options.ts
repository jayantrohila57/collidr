import "server-only";

import type { AppRouter } from "@loftlancer/api/routers/index";
import { transformer } from "@loftlancer/api/transformer";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

/** TanStack Query keys for SSR prefetch — no React context (see `utils/trpc.ts` for the browser client). */
const prefetchQueryClient = new QueryClient();
const prefetchTrpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer,
    }),
  ],
});

export const trpcQueryOptions = createTRPCOptionsProxy<AppRouter>({
  client: prefetchTrpcClient,
  queryClient: prefetchQueryClient,
});
