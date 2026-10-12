import { TRPCError } from "@trpc/server";

const RAW_DB_PATTERNS = [
  /failed query/i,
  /insert into/i,
  /update "/i,
  /delete from/i,
  /violates unique constraint/i,
  /duplicate key/i,
];

function isPostgresUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  return code === "23505";
}

export function getFriendlyErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof TRPCError) {
    return error.message;
  }

  if (isPostgresUniqueViolation(error)) {
    return "A project with this name already exists. Try a different name.";
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  if (!message || RAW_DB_PATTERNS.some((pattern) => pattern.test(message))) {
    return fallback;
  }

  return message;
}

export function throwFriendlyError(
  error: unknown,
  options: { fallback: string; code?: TRPCError["code"] },
): never {
  throw new TRPCError({
    code: options.code ?? "INTERNAL_SERVER_ERROR",
    message: getFriendlyErrorMessage(error, options.fallback),
    cause: error,
  });
}
