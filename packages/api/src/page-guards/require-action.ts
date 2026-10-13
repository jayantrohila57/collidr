import type { ActionName } from "@collidr/actions";
import { TRPCError } from "@trpc/server";
import {
  type RequireActionContext,
  requireAction,
} from "../actions/require-action";
import { PageForbiddenError, PageNotFoundError } from "./errors";

export async function requirePageAction(
  action: ActionName,
  ctx: RequireActionContext,
): Promise<void> {
  try {
    await requireAction(action, ctx);
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.code === "FORBIDDEN") {
        throw new PageForbiddenError(error.message);
      }
      if (error.code === "NOT_FOUND") {
        throw new PageNotFoundError(error.message);
      }
    }
    throw error;
  }
}
