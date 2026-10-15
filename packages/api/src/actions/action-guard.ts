import type { ActionName } from "@loftlancer/actions";
import { TRPCError } from "@trpc/server";
import { t } from "../index";
import type { RequireActionContext } from "./require-action";
import { requireAction } from "./require-action";

type GuardCtx = {
  session: { user: { id: string } };
  activeOrganizationId?: string | null;
};

export function actionGuard(
  action: ActionName,
  resolve?: (
    input: unknown,
    ctx: GuardCtx,
  ) => Partial<RequireActionContext> | Promise<Partial<RequireActionContext>>,
) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    const input = "input" in opts ? opts.input : undefined;
    if (resolve && (input === undefined || input === null)) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "actionGuard ran before procedure input was parsed — declare .input() before .use(actionGuard)",
      });
    }
    const guardCtx = ctx as GuardCtx;
    const partial = await Promise.resolve(resolve?.(input, guardCtx) ?? {});

    await requireAction(action, {
      userId: guardCtx.session.user.id,
      organizationId: guardCtx.activeOrganizationId ?? null,
      ...partial,
    });

    return next();
  });
}
