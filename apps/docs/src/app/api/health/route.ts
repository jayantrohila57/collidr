export const dynamic = "force-static";

/**
 * Uptime probe for the docs site (#356). Docs is a static export with no
 * database, so this is a build-time JSON file: a 200 means the docs service
 * is serving the current deployment. vercel.json sets no-store and noindex.
 */
export function GET() {
  return Response.json({
    status: "ok",
    app: "docs",
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
    checks: {},
    builtAt: new Date().toISOString(),
  });
}
