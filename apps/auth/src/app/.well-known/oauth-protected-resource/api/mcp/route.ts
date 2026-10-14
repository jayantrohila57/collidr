import { handlePlatformAuthWellKnown } from "@/lib/well-known-handler";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handlePlatformAuthWellKnown(request);
}

export function HEAD(request: Request) {
  return handlePlatformAuthWellKnown(request);
}
