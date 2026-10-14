import { sessionUserIsPlatformAdmin } from "@collidr/actions/platform-admin-flag";
import type { AuthSession } from "@collidr/auth/session-types";
import { TRPCError } from "@trpc/server";
import { requireAction } from "../actions/require-action";
import { assertConsoleOperator } from "../console-access";
import { runWithPlatformAdminContext } from "../platform-admin-context";
import { PageForbiddenError } from "./errors";

export async function requireConsoleOperatorPage(
  session: AuthSession,
): Promise<void> {
  try {
    assertConsoleOperator(session, { surface: "page" });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "FORBIDDEN") {
      throw new PageForbiddenError(error.message);
    }
    throw error;
  }

  const platformAdmin = sessionUserIsPlatformAdmin(
    session.user as { role?: string | null },
  );

  await runWithPlatformAdminContext(platformAdmin, async () => {
    await requireAction("platform.user.list", {
      userId: session.user.id,
    });
  });
}
