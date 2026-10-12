import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";
import { getFriendlyErrorMessage } from "./errors";
import {
  getActiveOrganizationId,
  requireActiveOrganization,
} from "./org-access";

export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    const fallback = shape.message || "Something went wrong. Please try again.";
    const fromCause = getFriendlyErrorMessage(error.cause ?? error, fallback);
    const fromShape = getFriendlyErrorMessage(
      shape.message ? new Error(shape.message) : null,
      fromCause,
    );
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
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
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
