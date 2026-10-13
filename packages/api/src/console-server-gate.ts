import { sessionUserIsPlatformAdmin } from "@collidr/actions/platform-admin-flag";
import { auth } from "@collidr/auth";
import { isEmailAllowedForConsole } from "@collidr/env/console";
export type ConsoleGateResult =
  | {
      ok: true;
      session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
    }
  | {
      ok: false;
      reason: "unauthenticated" | "not_admin" | "email_not_allowed";
    };

export async function getConsoleGate(
  headers: Headers,
): Promise<ConsoleGateResult> {
  const session = await auth.api.getSession({ headers });
  if (!session) {
    return { ok: false, reason: "unauthenticated" };
  }
  if (!sessionUserIsPlatformAdmin(session.user as { role?: string | null })) {
    return { ok: false, reason: "not_admin" };
  }
  if (!session.user.email || !isEmailAllowedForConsole(session.user.email)) {
    return { ok: false, reason: "email_not_allowed" };
  }
  return { ok: true, session };
}
