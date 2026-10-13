import { db } from "@env-manager/db";
import {
  environment,
  environmentVariable,
  project,
} from "@env-manager/db/schema/projects";
import { TRPCError } from "@trpc/server";
import { and, eq, ne, sql } from "drizzle-orm";
import { z } from "zod/v3";
import { createAuditLog } from "../audit";
import {
  assertValidEnvironmentName,
  normalizeEnvironmentName,
  slugifyEnvironmentName,
} from "../environment-name";
import { protectedProcedure, router } from "../index";
import { loadVariableActors } from "../lib/variable-actors";
import { isVariablesV2Enabled } from "../lib/variables-v2";
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

      const v2 = isVariablesV2Enabled();

      if (!v2) {
        const environments = await db
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
          .where(eq(environment.projectId, input.projectId))
          .orderBy(environment.name);

        return respond({ message: "Environments fetched", data: environments });
      }

      const environments = await db
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
          createdBy: environment.createdBy,
          updatedBy: environment.updatedBy,
        })
        .from(environment)
        .where(eq(environment.projectId, input.projectId))
        .orderBy(environment.name);

      const actors = await loadVariableActors(
        environments.flatMap((row) => [row.createdBy, row.updatedBy]),
      );

      const data = environments.map((row) => ({
        ...row,
        createdByUser: row.createdBy
          ? (actors.get(row.createdBy) ?? null)
          : null,
      }));

      return respond({ message: "Environments fetched", data });
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
      const v2 = isVariablesV2Enabled();
      const accessFilter = and(
        eq(environment.id, input.id),
        eq(project.userId, ctx.session.user.id),
      );

      if (!v2) {
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
          .where(accessFilter)
          .limit(1);

        if (environmentData.length === 0) {
          return respond({
            message: "Environment not found",
            data: { environment: null, variables: [] },
          });
        }

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

        return respond({
          message: "Environment fetched",
          data: {
            environment: environmentData[0] ?? null,
            variables,
          },
        });
      }

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
          createdBy: environment.createdBy,
          updatedBy: environment.updatedBy,
        })
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(accessFilter)
        .limit(1);

      if (environmentData.length === 0) {
        return respond({
          message: "Environment not found",
          data: { environment: null, variables: [] },
        });
      }

      const environmentRecord = environmentData[0];
      if (!environmentRecord) {
        return respond({
          message: "Environment not found",
          data: { environment: null, variables: [] },
        });
      }

      const variables = await db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
          environmentId: environmentVariable.environmentId,
          createdAt: environmentVariable.createdAt,
          updatedAt: environmentVariable.updatedAt,
          type: environmentVariable.type,
          note: environmentVariable.note,
          createdBy: environmentVariable.createdBy,
          updatedBy: environmentVariable.updatedBy,
        })
        .from(environmentVariable)
        .where(eq(environmentVariable.environmentId, input.id))
        .orderBy(environmentVariable.key);

      const envActors = await loadVariableActors([
        environmentRecord.createdBy,
        environmentRecord.updatedBy,
      ]);

      const varActors = await loadVariableActors(
        variables.map((row) => row.updatedBy),
      );

      return respond({
        message: "Environment fetched",
        data: {
          environment: {
            ...environmentRecord,
            createdByUser: environmentRecord.createdBy
              ? (envActors.get(environmentRecord.createdBy) ?? null)
              : null,
          },
          variables: variables.map((row) => ({
            ...row,
            updatedByUser: row.updatedBy
              ? (varActors.get(row.updatedBy) ?? null)
              : null,
          })),
        },
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

      const name = normalizeEnvironmentName(input.name);
      const slug = input.slug || slugifyEnvironmentName(name);

      const duplicateName = await db
        .select({ id: environment.id })
        .from(environment)
        .where(
          and(
            eq(environment.projectId, input.projectId),
            sql`lower(trim(${environment.name})) = lower(${name})`,
          ),
        )
        .limit(1);

      if (duplicateName.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `An environment named "${name}" already exists in this project.`,
        });
      }

      const v2 = isVariablesV2Enabled();
      const userId = ctx.session.user.id;
      const newId = crypto.randomUUID();

      if (!v2) {
        const newEnvironment = await db
          .insert(environment)
          .values({
            id: newId,
            name,
            slug,
            branch: input.branch || null,
            deployedUrl: input.deployedUrl || null,
            status: input.status,
            isProduction: input.isProduction,
            description: input.description || null,
            projectId: input.projectId,
          })
          .returning({
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
          });

        const created = newEnvironment[0];
        if (!created) {
          return respond({
            message: "Failed to create environment",
            data: null,
          });
        }

        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: input.projectId,
          environmentId: created.id,
          action: "CREATE",
          entityType: "ENVIRONMENT",
          entitySlug: created.slug,
          newValue: JSON.stringify({ name: created.name }),
        });

        return respond({
          message: "Environment created",
          data: created,
        });
      }

      const newEnvironment = await db
        .insert(environment)
        .values({
          id: newId,
          name,
          slug,
          branch: input.branch || null,
          deployedUrl: input.deployedUrl || null,
          status: input.status,
          isProduction: input.isProduction,
          description: input.description || null,
          projectId: input.projectId,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning({
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
          createdBy: environment.createdBy,
          updatedBy: environment.updatedBy,
        });

      const created = newEnvironment[0];
      if (!created) {
        return respond({
          message: "Failed to create environment",
          data: null,
        });
      }

      await createAuditLog({
        userId: ctx.session.user.id,
        projectId: input.projectId,
        environmentId: created.id,
        action: "CREATE",
        entityType: "ENVIRONMENT",
        entitySlug: created.slug,
        newValue: JSON.stringify({ name: created.name }),
      });

      const actors = await loadVariableActors([created.createdBy]);
      return respond({
        message: "Environment created",
        data: {
          ...created,
          createdByUser: created.createdBy
            ? (actors.get(created.createdBy) ?? null)
            : null,
        },
      });
    }),

  // Update an environment
  update: protectedProcedure
    .input(updateEnvironmentInput)
    .output(makeResponseSchema(environmentOutput.nullable()))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through project
      const existingEnvironment = await db
        .select({
          id: environment.id,
          name: environment.name,
          slug: environment.slug,
          projectId: environment.projectId,
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

      if (existingEnvironment.length === 0) {
        return respond({ message: "Environment not found", data: null });
      }

      const existing = existingEnvironment[0];
      if (!existing) {
        return respond({ message: "Environment not found", data: null });
      }

      const updateData: {
        name?: string;
        slug?: string;
        branch?: string | null;
        deployedUrl?: string | null;
        status?: "active" | "inactive" | "building" | "failed";
        isProduction?: boolean;
        description?: string | null;
        updatedBy?: string;
      } = {};
      if (input.name !== undefined) {
        const name = assertValidEnvironmentName(input.name);
        const duplicateName = await db
          .select({ id: environment.id })
          .from(environment)
          .where(
            and(
              eq(environment.projectId, existing.projectId),
              sql`lower(trim(${environment.name})) = lower(${name})`,
              ne(environment.id, input.id),
            ),
          )
          .limit(1);

        if (duplicateName.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `An environment named "${name}" already exists in this project.`,
          });
        }

        updateData.name = name;
        if (input.slug === undefined) {
          updateData.slug = slugifyEnvironmentName(name);
        }
      }
      if (input.slug !== undefined) updateData.slug = input.slug;
      if (input.branch !== undefined) updateData.branch = input.branch || null;
      if (input.deployedUrl !== undefined)
        updateData.deployedUrl = input.deployedUrl || null;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.isProduction !== undefined)
        updateData.isProduction = input.isProduction;
      if (input.description !== undefined)
        updateData.description = input.description || null;

      if (isVariablesV2Enabled()) {
        updateData.updatedBy = ctx.session.user.id;
      }

      const v2 = isVariablesV2Enabled();

      if (!v2) {
        const updatedEnvironment = await db
          .update(environment)
          .set(updateData)
          .where(eq(environment.id, input.id))
          .returning({
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
          });

        const updated = updatedEnvironment[0];
        if (!updated) {
          return respond({
            message: "Failed to update environment",
            data: null,
          });
        }

        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: existing.projectId,
          environmentId: updated.id,
          action: "UPDATE",
          entityType: "ENVIRONMENT",
          entitySlug: updated.slug,
          newValue: JSON.stringify({ name: updated.name }),
        });

        return respond({
          message: "Environment updated",
          data: updated,
        });
      }

      const updatedEnvironment = await db
        .update(environment)
        .set(updateData)
        .where(eq(environment.id, input.id))
        .returning({
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
          createdBy: environment.createdBy,
          updatedBy: environment.updatedBy,
        });

      const updated = updatedEnvironment[0];
      if (!updated) {
        return respond({ message: "Failed to update environment", data: null });
      }

      await createAuditLog({
        userId: ctx.session.user.id,
        projectId: existing.projectId,
        environmentId: updated.id,
        action: "UPDATE",
        entityType: "ENVIRONMENT",
        entitySlug: updated.slug,
        newValue: JSON.stringify({ name: updated.name }),
      });

      const actors = await loadVariableActors([updated.createdBy]);
      return respond({
        message: "Environment updated",
        data: {
          ...updated,
          createdByUser: updated.createdBy
            ? (actors.get(updated.createdBy) ?? null)
            : null,
        },
      });
    }),

  // Delete an environment (and all its variables)
  delete: protectedProcedure
    .input(getEnvironmentInput)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through project
      const existingEnvironment = await db
        .select({
          envId: environment.id,
          envName: environment.name,
          envSlug: environment.slug,
          projectId: project.id,
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

      if (existingEnvironment.length === 0) {
        return { success: false };
      }

      const row = existingEnvironment[0];
      const envRecord = row
        ? { id: row.envId, name: row.envName, slug: row.envSlug }
        : undefined;
      const projectRecord = row ? { id: row.projectId } : undefined;

      // Delete environment (cascade will handle variables)
      await db.delete(environment).where(eq(environment.id, input.id));

      if (envRecord && projectRecord) {
        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: projectRecord.id,
          environmentId: envRecord.id,
          action: "DELETE",
          entityType: "ENVIRONMENT",
          entitySlug: envRecord.slug,
          oldValue: JSON.stringify({ name: envRecord.name }),
        });
      }

      return { success: true };
    }),
});
