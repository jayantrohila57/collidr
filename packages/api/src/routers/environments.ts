import { db } from "@env-manager/db";
import {
  environment,
  environmentVariable,
  project,
} from "@env-manager/db/schema/projects";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v3";
import { protectedProcedure, router } from "../index";
import {
  createEnvironmentInput,
  environmentOutput,
  getEnvironmentInput,
  listEnvironmentsInput,
  makeResponseSchema,
  respond,
  updateEnvironmentInput,
  variableOutput,
} from "../validation";

export const environmentsRouter = router({
  // List all environments for a project
  list: protectedProcedure
    .input(listEnvironmentsInput)
    .output(makeResponseSchema(z.array(environmentOutput)))
    .query(async ({ ctx, input }) => {
      // Verify user owns project
      const projectExists = await db
        .select()
        .from(project)
        .where(
          and(
            eq(project.id, input.projectId),
            eq(project.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (projectExists.length === 0) {
        return respond({ message: "Project not found", data: [] });
      }

      const environments = await db
        .select()
        .from(environment)
        .where(eq(environment.projectId, input.projectId))
        .orderBy(environment.name);

      return respond({ message: "Environments fetched", data: environments });
    }),

  // Get a single environment with its variables
  get: protectedProcedure
    .input(getEnvironmentInput)
    .output(
      makeResponseSchema(
        z.object({
          environment: environmentOutput.nullable(),
          variables: z.array(variableOutput),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      // Verify user owns the environment through project
      const environmentData = await db
        .select({
          id: environment.id,
          name: environment.name,
          slug: environment.slug,
          branch: environment.branch,
          deployedUrl: environment.deployedUrl,
          status: environment.status,
          isProduction: environment.isProduction,
          description: environment.description,
          projectId: environment.projectId,
          createdAt: environment.createdAt,
          updatedAt: environment.updatedAt,
        })
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          and(
            eq(environment.id, input.id),
            eq(project.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (environmentData.length === 0) {
        return respond({
          message: "Environment not found",
          data: { environment: null, variables: [] },
        });
      }

      // Get variables for this environment
      const variables = await db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
          environmentId: environmentVariable.environmentId,
          createdAt: environmentVariable.createdAt,
          updatedAt: environmentVariable.updatedAt,
        })
        .from(environmentVariable)
        .where(eq(environmentVariable.environmentId, input.id))
        .orderBy(environmentVariable.key);

      const environmentRecord = environmentData[0];

      if (!environmentRecord) {
        return respond({
          message: "Environment not found",
          data: { environment: null, variables: [] },
        });
      }

      return respond({
        message: "Environment fetched",
        data: { environment: environmentRecord, variables },
      });
    }),

  // Create a new environment
  create: protectedProcedure
    .input(createEnvironmentInput)
    .output(makeResponseSchema(environmentOutput.nullable()))
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the project
      const projectExists = await db
        .select()
        .from(project)
        .where(
          and(
            eq(project.id, input.projectId),
            eq(project.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (projectExists.length === 0) {
        return respond({ message: "Project not found", data: null });
      }

      const newEnvironment = await db
        .insert(environment)
        .values({
          id: crypto.randomUUID(),
          name: input.name,
          slug:
            input.slug ||
            input.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""),
          branch: input.branch || null,
          deployedUrl: input.deployedUrl || null,
          status: input.status,
          isProduction: input.isProduction,
          description: input.description || null,
          projectId: input.projectId,
        })
        .returning();

      if (!newEnvironment[0]) {
        return respond({
          message: "Failed to create environment",
          data: null,
        });
      }

      return respond({
        message: "Environment created",
        data: newEnvironment[0],
      });
    }),

  // Update an environment
  update: protectedProcedure
    .input(updateEnvironmentInput)
    .output(makeResponseSchema(environmentOutput.nullable()))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through project
      const existingEnvironment = await db
        .select()
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          and(
            eq(environment.id, input.id),
            eq(project.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (existingEnvironment.length === 0) {
        return respond({ message: "Environment not found", data: null });
      }

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.slug !== undefined) updateData.slug = input.slug;
      if (input.branch !== undefined) updateData.branch = input.branch || null;
      if (input.deployedUrl !== undefined)
        updateData.deployedUrl = input.deployedUrl || null;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.isProduction !== undefined)
        updateData.isProduction = input.isProduction;
      if (input.description !== undefined)
        updateData.description = input.description || null;

      const updatedEnvironment = await db
        .update(environment)
        .set(updateData)
        .where(eq(environment.id, input.id))
        .returning();

      if (!updatedEnvironment[0]) {
        return respond({ message: "Failed to update environment", data: null });
      }

      return respond({
        message: "Environment updated",
        data: updatedEnvironment[0],
      });
    }),

  // Delete an environment (and all its variables)
  delete: protectedProcedure
    .input(getEnvironmentInput)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through project
      const existingEnvironment = await db
        .select()
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          and(
            eq(environment.id, input.id),
            eq(project.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (existingEnvironment.length === 0) {
        return { success: false };
      }

      // Delete environment (cascade will handle variables)
      await db.delete(environment).where(eq(environment.id, input.id));

      return { success: true };
    }),
});
