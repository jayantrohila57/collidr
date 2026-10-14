import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { projectIdFromInput } from "../actions/guard-resolve";
import { buildPermissionsSnapshot } from "../actions/permissions-snapshot";
import { orgAwareProcedure, router } from "../index";
import { getActiveOrganizationId } from "../org-access";

export const permissionsRouter = router({
  snapshot: orgAwareProcedure
    .input(
      z
        .object({
          projectId: z.string().optional(),
        })
        .optional(),
    )
    .use(actionGuard("organization.view", projectIdFromInput))
    .query(async ({ ctx, input }) => {
      const organizationId = getActiveOrganizationId(ctx.session);
      return buildPermissionsSnapshot({
        userId: ctx.session.user.id,
        organizationId,
        projectId: input?.projectId,
      });
    }),
});
