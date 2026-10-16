import { BASE_PATH } from "@/lib/base-path";
import { createContextWithAuth } from "@loftlancer/api/create-context";
import { accountAppRouter } from "@loftlancer/api/routers/account-app";
import { logSchemaOutOfDateOnce } from "@loftlancer/db/postgres-errors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { siblingAuth } from "@/lib/sibling-auth";

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: new URL(req.url).pathname.startsWith(`${BASE_PATH}/api/trpc`)
      ? `${BASE_PATH}/api/trpc`
      : "/api/trpc",
    req,
    router: accountAppRouter,
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
