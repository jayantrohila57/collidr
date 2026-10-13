import { TRPCClientError } from "@trpc/client";

const RAW_DB_PATTERNS = [
  /failed query/i,
  /insert into/i,
  /update "/i,
  /delete from/i,
  /select .+ from/i,
  /violates unique constraint/i,
  /duplicate key/i,
  /encrypted_value/i,
  /params:/i,
  /relation .+ does not exist/i,
  /column .+ does not exist/i,
  /organization_id/i,
  /user_id/i,
  /active_organization/i,
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
];

function tryParseSerializedZodIssues(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0] as {
        message?: string;
        path?: (string | number)[];
      };
      if (first?.message) {
        if (
          first.message === "Invalid uuid" &&
          first.path?.includes("environmentId")
        ) {
          return "This environment is not ready yet. Wait a moment and try again.";
        }
        return first.message;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return true;
  }
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error);
  return (
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("load failed")
  );
}

export function getClientErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isNetworkError(error)) {
    return "You appear to be offline or the network is unavailable. Check your connection and try again.";
  }

  if (error instanceof TRPCClientError) {
    const message = error.message?.trim();
    const fromZod = message ? tryParseSerializedZodIssues(message) : null;
    if (fromZod) return fromZod;
    if (message && !RAW_DB_PATTERNS.some((p) => p.test(message))) {
      return message;
    }
    return fallback;
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    const fromZod = tryParseSerializedZodIssues(message);
    if (fromZod) return fromZod;
    if (message && !RAW_DB_PATTERNS.some((p) => p.test(message))) {
      return message;
    }
  }

  return fallback;
}
