import type { AuthSession } from "@collidr/auth/session-types";
import type { NextRequest } from "next/server";

type SessionAuth = {
  api: {
    getSession: (input: { headers: Headers }) => Promise<AuthSession | null>;
  };
};

export async function createContextWithAuth(
  req: NextRequest,
  auth: SessionAuth,
) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContextWithAuth>>;
