import { createContext } from "@env-manager/api/context";
import { appRouter } from "@env-manager/api/routers/index";
import { logSchemaOutOfDateOnce } from "@env-manager/db/postgres-errors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError({ error, path, type }) {
      const root = error.cause ?? error;
      if (logSchemaOutOfDateOnce(root, `tRPC ${type} ${path ?? "unknown"}`)) {
        return;
      }
      console.error(`[tRPC] ${type} ${path ?? "unknown"}:`, error);
    },
  });
}
export { handler as GET, handler as POST };
