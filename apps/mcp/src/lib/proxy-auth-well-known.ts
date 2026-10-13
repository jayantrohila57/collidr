import { resolveAuthServiceUrl } from "@collidr/env/vercel-services";

/** Proxy OAuth discovery documents from the auth service (private binding at runtime). */
export async function proxyAuthWellKnown(
  request: Request,
  wellKnownPath: string,
): Promise<Response> {
  const authBase = resolveAuthServiceUrl().replace(/\/$/, "");
  const incoming = new URL(request.url);
  const relative = wellKnownPath.replace(/^\//, "");
  const target = new URL(relative, `${authBase}/`);
  target.search = incoming.search;

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
