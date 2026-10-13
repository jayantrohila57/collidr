import "server-only";

import type { StudioRouter } from "@collidr/api/routers/studio";
import { transformer } from "@collidr/api/transformer";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

/** TanStack Query keys for SSR prefetch — no React context (see `utils/trpc.ts` for the browser client). */
const prefetchQueryClient = new QueryClient();
const prefetchTrpcClient = createTRPCClient<StudioRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer,
    }),
  ],
});

export const trpcQueryOptions = createTRPCOptionsProxy<StudioRouter>({
  client: prefetchTrpcClient,
  queryClient: prefetchQueryClient,
});
