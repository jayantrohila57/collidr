import { auth } from "@collidr/auth";
import { logSchemaOutOfDateOnce } from "@collidr/db/postgres-errors";
import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";

const { GET: authGet, POST: authPost } = toNextJsHandler(auth.handler);

function withSchemaGuard(
  handler: (req: NextRequest) => Promise<Response> | Response,
  method: string,
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      logSchemaOutOfDateOnce(error, `better-auth ${method}`);
      throw error;
    }
  };
}

export const GET = withSchemaGuard(authGet, "GET");
export const POST = withSchemaGuard(authPost, "POST");
