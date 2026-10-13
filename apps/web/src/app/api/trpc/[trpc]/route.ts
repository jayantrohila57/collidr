import { createContext } from "@env-manager/api/context";
import { appRouter } from "@env-manager/api/routers/index";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError({ error, path, type }) {
      console.error(`[tRPC] ${type} ${path ?? "unknown"}:`, error);
    },
  });
}
export { handler as GET, handler as POST };
