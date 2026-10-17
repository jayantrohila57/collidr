import { NextResponse } from "next/server";
import { getPlatformStatus } from "@/lib/status/betterstack";

/**
 * Public platform status for loftlancer.com/status (#369). The Better Stack
 * token stays on the server; the CDN caches the JSON for 60 seconds.
 */
export const revalidate = 60;

export async function GET() {
  const status = await getPlatformStatus(
    process.env.BETTERSTACK_API_TOKEN?.trim() || undefined,
  );
  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
