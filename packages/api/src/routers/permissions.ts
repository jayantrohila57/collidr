import { z } from "zod/v3";
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
    .query(async ({ ctx, input }) => {
      const organizationId = getActiveOrganizationId(ctx.session);
      return buildPermissionsSnapshot({
        userId: ctx.session.user.id,
        organizationId,
        projectId: input?.projectId,
      });
    }),
});
