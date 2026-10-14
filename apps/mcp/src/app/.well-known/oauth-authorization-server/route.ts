import { proxyAuthWellKnown } from "@/lib/proxy-auth-well-known";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return proxyAuthWellKnown(request);
}

export function HEAD(request: Request) {
  return proxyAuthWellKnown(request);
}
