import { withBasePath } from "@/lib/base-path";
import "server-only";

import type { StudioRouter } from "@loftlancer/api/routers/studio";
import { transformer } from "@loftlancer/api/transformer";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

/** TanStack Query keys for SSR prefetch — no React context (see `utils/trpc.ts` for the browser client). */
const prefetchQueryClient = new QueryClient();
const prefetchTrpcClient = createTRPCClient<StudioRouter>({
  links: [
    httpBatchLink({
      url: withBasePath("/api/trpc"),
      transformer,
    }),
  ],
});

export const trpcQueryOptions = createTRPCOptionsProxy<StudioRouter>({
  client: prefetchTrpcClient,
  queryClient: prefetchQueryClient,
});
