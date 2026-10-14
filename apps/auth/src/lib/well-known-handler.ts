import { platformAuth } from "@/lib/platform-auth";

/** Delegate RFC 8414 / 9728 discovery to the platform Better Auth handler. */
export function handlePlatformAuthWellKnown(request: Request) {
  return platformAuth.handler(request);
}
