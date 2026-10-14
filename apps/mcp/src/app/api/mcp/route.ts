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

export async function POST(request: Request) {
  const handler = await getHandler();
  return handler(request);
}

export async function GET() {
  return new Response(
    JSON.stringify({
      name: "loftlancer-mcp",
      protocol: "mcp-2026-07-28",
      endpoint: "/api/mcp",
      auth: "oauth2",
    }),
    {
      headers: { "content-type": "application/json" },
    },
  );
}
