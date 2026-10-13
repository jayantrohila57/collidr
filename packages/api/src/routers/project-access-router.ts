import { db } from "@env-manager/db";
import {
  projectManager,
  projectMemberGrant,
  projectTeam,
} from "@env-manager/db/schema/project-access";
import { project } from "@env-manager/db/schema/projects";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { orgProcedure, router } from "../index";
import { assertProjectAccess } from "../org-access";
export const projectAccessRouter = router({
  listManagers: orgProcedure
    .input(z.object({ projectId: z.string() }))
    .use(
      actionGuard("project.read", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .query(async ({ ctx, input }) => {
      await assertProjectAccess(
        ctx.session.user.id,
        input.projectId,
        ctx.activeOrganizationId,
      );
      const rows = await db
        .select()
        .from(projectManager)
        .where(
          and(
            eq(projectManager.projectId, input.projectId),
            isNull(projectManager.deletedAt),
          ),
        );
      return { items: rows };
    }),

  assignManager: orgProcedure
    .input(z.object({ projectId: z.string(), userId: z.string() }))
    .use(
      actionGuard("project.assign_manager", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No active org" });
      }
      const [proj] = await db
        .select({ id: project.id })
        .from(project)
        .where(
          and(
            eq(project.id, input.projectId),
            eq(project.organizationId, organizationId),
            isNull(project.deletedAt),
          ),
        )
        .limit(1);
      if (!proj) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      await db.insert(projectManager).values({
        id: crypto.randomUUID(),
        organizationId,
        projectId: input.projectId,
        userId: input.userId,
        createdBy: ctx.session.user.id,
      });

      return { ok: true };
    }),

  setMemberGrants: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        grants: z.array(z.string()),
      }),
    )
    .use(
      actionGuard("project.permission.grant", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No active org" });
      }

      const [existing] = await db
        .select({ id: projectMemberGrant.id })
        .from(projectMemberGrant)
        .where(
          and(
            eq(projectMemberGrant.projectId, input.projectId),
            eq(projectMemberGrant.userId, input.userId),
            isNull(projectMemberGrant.deletedAt),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .update(projectMemberGrant)
          .set({
            grants: input.grants,
            updatedBy: ctx.session.user.id,
            updatedAt: new Date(),
          })
          .where(eq(projectMemberGrant.id, existing.id));
      } else {
        await db.insert(projectMemberGrant).values({
          id: crypto.randomUUID(),
          organizationId,
          projectId: input.projectId,
          userId: input.userId,
          grants: input.grants,
          updatedBy: ctx.session.user.id,
        });
      }

      return { ok: true };
    }),

  assignTeam: orgProcedure
    .input(z.object({ projectId: z.string(), teamId: z.string() }))
    .use(
      actionGuard("project.assign_team", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No active org" });
      }

      await db.insert(projectTeam).values({
        id: crypto.randomUUID(),
        organizationId,
        projectId: input.projectId,
        teamId: input.teamId,
        createdBy: ctx.session.user.id,
      });

      return { ok: true };
    }),
});
