import {
  mcpCorsPreflightResponse,
  withMcpCors,
} from "@loftlancer/mcp/http-cors";

export const runtime = "nodejs";

let cachedHandler: ((request: Request) => Promise<Response>) | undefined;

async function getHandler() {
  if (!cachedHandler) {
    const { createLoftlancerMcpHttpHandler } = await import(
      "@loftlancer/mcp/handler"
    );
    cachedHandler = createLoftlancerMcpHttpHandler();
  }
  return cachedHandler;
}

export async function OPTIONS(request: Request) {
  return mcpCorsPreflightResponse(request) ?? new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  const preflight = mcpCorsPreflightResponse(request);
  if (preflight) {
    return preflight;
  }
  const handler = await getHandler();
  return withMcpCors(request, await handler(request));
}

export async function GET(request: Request) {
  const preflight = mcpCorsPreflightResponse(request);
  if (preflight) {
    return preflight;
  }
  return withMcpCors(
    request,
    new Response(
      JSON.stringify({
        name: "loftlancer-mcp",
        protocol: "mcp-2026-07-28",
        endpoint: "/api/mcp",
        auth: "oauth2",
      }),
      {
        headers: { "content-type": "application/json" },
      },
    ),
  );
}
