import { isActionsAuditEnabled, type ActionName } from "@env-manager/actions";
import type { RequireActionContext } from "./require-action";
import { requireAction } from "./require-action";
import { t } from "../index";

type GuardCtx = {
  session: { user: { id: string } };
  activeOrganizationId?: string | null;
};

export function actionGuard(
  action: ActionName,
  resolve?: (input: unknown, ctx: GuardCtx) => Partial<RequireActionContext>,
) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!isActionsAuditEnabled()) {
      return next();
    }

    const input = "input" in opts ? opts.input : undefined;
    const guardCtx = ctx as GuardCtx;
    const partial = resolve?.(input, guardCtx) ?? {};

    await requireAction(action, {
      userId: guardCtx.session.user.id,
      organizationId: guardCtx.activeOrganizationId ?? null,
      ...partial,
    });

    return next();
  });
}
