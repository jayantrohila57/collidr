export const runtime = "nodejs";

let cachedHandler: ((request: Request) => Promise<Response>) | undefined;

async function getHandler() {
  if (!cachedHandler) {
    const { createCollidrMcpHttpHandler } = await import(
      "@collidr/mcp/handler"
    );
    cachedHandler = createCollidrMcpHttpHandler();
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
      name: "collidr-mcp",
      protocol: "mcp-2026-07-28",
      endpoint: "/api/mcp",
      auth: "oauth2",
    }),
    {
      headers: { "content-type": "application/json" },
    },
  );
}
