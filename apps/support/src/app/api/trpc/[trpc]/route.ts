import { createContext } from "@loftlancer/api/context";
import { supportAppRouter } from "@loftlancer/api/routers/support-app";
import { logSchemaOutOfDateOnce } from "@loftlancer/db/postgres-errors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: supportAppRouter,
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
