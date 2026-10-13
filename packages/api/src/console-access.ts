import { sessionUserIsPlatformAdmin } from "@env-manager/actions/platform-admin-flag";
import { isEmailAllowedForConsole } from "@env-manager/env/console";
import { TRPCError } from "@trpc/server";

type SessionPayload = {
  user: { id: string; email: string; role?: string | null };
};

export function assertConsoleOperator(session: SessionPayload): void {
  if (!sessionUserIsPlatformAdmin(session.user)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Platform admin role required",
    });
  }
  if (!isEmailAllowedForConsole(session.user.email)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Console access is restricted to authorized operators",
    });
  }
}

export function isConsoleOperator(session: SessionPayload | null): boolean {
  if (!session) return false;
  try {
    assertConsoleOperator(session);
    return true;
  } catch {
    return false;
  }
}

export function getPlatformAdminFromSession(
  session: SessionPayload | null | undefined,
): boolean {
  return sessionUserIsPlatformAdmin(session?.user);
}
