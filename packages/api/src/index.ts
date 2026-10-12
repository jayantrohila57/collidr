import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";
import { getFriendlyErrorMessage } from "./errors";

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
