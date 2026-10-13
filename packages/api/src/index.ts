import { sessionUserIsPlatformAdmin } from "@collidr/actions/platform-admin-flag";
import {
  isPostgresMissingColumnError,
  logSchemaOutOfDateOnce,
} from "@collidr/db/postgres-errors";
import { isOrganizationsEnabled } from "@collidr/env/organizations";
import { initTRPC, TRPCError } from "@trpc/server";
import { assertConsoleOperator } from "./console-access";
import { runWithConsoleAuditContext } from "./console-audit-context";
import type { Context } from "./context";
import { getFriendlyErrorMessage } from "./errors";
import {
  getActiveOrganizationId,
  requireActiveOrganization,
} from "./org-access";
import { runWithPlatformAdminContext } from "./platform-admin-context";

export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    const fallback = shape.message || "Something went wrong. Please try again.";
    const fromCause = getFriendlyErrorMessage(error.cause ?? error, fallback);
    const fromShape = getFriendlyErrorMessage(
      shape.message ? new Error(shape.message) : null,
      fromCause,
    );
    const root = error.cause ?? error;
    if (isPostgresMissingColumnError(root)) {
      logSchemaOutOfDateOnce(root, "tRPC errorFormatter");
    } else if (fromShape !== shape.message) {
      console.error("[tRPC] Sanitized error for client:", {
        code: shape.code,
        clientMessage: fromShape,
        cause: error.cause ?? error,
      });
    }
    return {
      ...shape,
      message: fromShape,
    };
  },
});

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  const session = ctx.session;
  const platformAdmin = sessionUserIsPlatformAdmin(
    session.user as { role?: string | null },
  );
  return runWithPlatformAdminContext(platformAdmin, () =>
    next({
      ctx: {
        session,
        platformAdmin,
      },
    }),
  );
});

/** Platform console operator — Admin role + `CONSOLE_ALLOWED_EMAILS` (Decision 11). */
export const consoleProcedure = protectedProcedure.use(({ ctx, next }) => {
  assertConsoleOperator(ctx.session);
  return runWithConsoleAuditContext(() => next({ ctx }));
});

/** When orgs are enabled, requires an active organization on the session. */
export const orgProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!isOrganizationsEnabled()) {
    return next({
      ctx: {
        ...ctx,
        activeOrganizationId: null as string | null,
      },
    });
  }

  const activeOrganizationId = await requireActiveOrganization(ctx.session);
  return next({
    ctx: {
      ...ctx,
      activeOrganizationId,
    },
  });
});

/** Exposes active org id when set; does not require org membership. */
export const orgAwareProcedure = protectedProcedure.use(({ ctx, next }) => {
  const activeOrganizationId = isOrganizationsEnabled()
    ? getActiveOrganizationId(ctx.session)
    : null;
  return next({
    ctx: {
      ...ctx,
      activeOrganizationId,
    },
  });
});
