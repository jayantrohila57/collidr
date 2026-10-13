export const runtime = "nodejs";

let cachedHandler: ((request: Request) => Promise<Response>) | undefined;

async function getHandler() {
  if (!cachedHandler) {
    const { createEnvManagerMcpHttpHandler } = await import(
      "@env-manager/mcp/handler"
    );
    cachedHandler = createEnvManagerMcpHttpHandler();
  }
  return cachedHandler;
}

export async function POST(request: Request) {
  const handler = await getHandler();
  return handler(request);
}

export async function GET() {
  return new Response(
    JSON.stringify({
      name: "env-manager-mcp",
      protocol: "mcp-2026-07-28",
      endpoint: "/api/mcp",
      auth: "oauth2",
    }),
    {
      headers: { "content-type": "application/json" },
    },
  );
}
