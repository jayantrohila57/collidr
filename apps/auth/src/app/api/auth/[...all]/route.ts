import {
  authApiCorsPreflightResponse,
  withAuthApiCors,
} from "@collidr/auth/auth-api-cors";
import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { platformAuth } from "@/lib/platform-auth";

const { GET: authGet, POST: authPost } = toNextJsHandler(platformAuth.handler);

async function withCors(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<Response> | Response,
) {
  const preflight = authApiCorsPreflightResponse(request);
  if (preflight) {
    return preflight;
  }
  const response = await handler(request);
  return withAuthApiCors(request, response);
}

export function GET(request: NextRequest) {
  return withCors(request, authGet);
}

export function POST(request: NextRequest) {
  return withCors(request, authPost);
}

export function OPTIONS(request: NextRequest) {
  return (
    authApiCorsPreflightResponse(request) ??
    new Response(null, {
      status: 204,
    })
  );
}
