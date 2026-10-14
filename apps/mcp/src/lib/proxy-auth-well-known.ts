import { resolveAuthServiceUrl } from "@collidr/env/vercel-services";

/** Proxy OAuth discovery documents from the auth service (private binding at runtime). */
export async function proxyAuthWellKnown(request: Request): Promise<Response> {
  const authBase = resolveAuthServiceUrl().replace(/\/$/, "");
  const incoming = new URL(request.url);
  const target = new URL(`${incoming.pathname}${incoming.search}`, `${authBase}/`);

  const upstream = await fetch(target.toString(), {
    headers: {
      accept: request.headers.get("accept") ?? "application/json",
    },
    cache: "no-store",
  });

  const headers = new Headers(upstream.headers);
  headers.delete("content-encoding");
  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
