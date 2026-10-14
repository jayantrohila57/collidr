import { createContextWithAuth } from "@collidr/api/create-context";
import { consoleAppRouter } from "@collidr/api/routers/console";
import { logSchemaOutOfDateOnce } from "@collidr/db/postgres-errors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { siblingAuth } from "@/lib/sibling-auth";

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: consoleAppRouter,
    createContext: () => createContextWithAuth(req, siblingAuth),
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
