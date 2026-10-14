import { isActionsAuditEnabled } from "@loftlancer/actions";
import { activeMemberWhere, db } from "@loftlancer/db";
import { member, organization } from "@loftlancer/db/schema/organization";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { requireAction } from "../actions/require-action";
import {
  orgAwareProcedure,
  orgProcedure,
  protectedProcedure,
  router,
} from "../index";
import { mcpMembersList } from "../mcp/organization-ops";

export const organizationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (isActionsAuditEnabled()) {
      await requireAction("organization.list", { userId });
    }

    const rows = await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        role: member.role,
        createdAt: organization.createdAt,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(
        activeMemberWhere(
          and(eq(member.userId, userId), isNull(organization.deletedAt)),
        ),
      );

    return { items: rows };
  }),

  getBySlug: orgAwareProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [row] = await db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          role: member.role,
        })
        .from(organization)
        .innerJoin(member, eq(member.organizationId, organization.id))
        .where(
          activeMemberWhere(
            and(
              eq(organization.slug, input.slug),
              eq(member.userId, userId),
              isNull(organization.deletedAt),
            ),
          ),
        )
        .limit(1);

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      if (isActionsAuditEnabled()) {
        await requireAction("organization.hub.view", {
          userId,
          organizationId: row.id,
        });
      }

      return row;
    }),

  listMembers: orgProcedure
    .use(actionGuard("member.list"))
    .query(async ({ ctx }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        return { items: [] };
      }
      return mcpMembersList(ctx.session.user.id, organizationId);
    }),
});
