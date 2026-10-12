import { TRPCClientError } from "@trpc/client";

const RAW_DB_PATTERNS = [
  /failed query/i,
  /insert into/i,
  /update "/i,
  /delete from/i,
];

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
    if (message && !RAW_DB_PATTERNS.some((p) => p.test(message))) {
      return message;
    }
    return fallback;
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    if (message && !RAW_DB_PATTERNS.some((p) => p.test(message))) {
      return message;
    }
  }

  return fallback;
}
