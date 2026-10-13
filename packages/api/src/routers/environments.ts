import {
  activeEnvironmentVariableWhere,
  activeEnvironmentWhere,
  db,
  softDeleteEnvironmentById,
} from "@collidr/db";
import {
  environment,
  environmentVariable,
  project,
} from "@collidr/db/schema/projects";
import { TRPCError } from "@trpc/server";
import { and, eq, ne, sql } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { createAuditLog } from "../audit";
import {
  assertEnvironmentAccess,
  lookupProjectIdByEnvironmentId,
} from "../environment-access";
import {
  assertValidEnvironmentName,
  normalizeEnvironmentName,
  slugifyEnvironmentName,
} from "../environment-name";
import { orgProcedure, router } from "../index";
import { assertProjectAccess } from "../org-access";
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
import {
  formatEnvironmentRows,
  formatSingleEnvironment,
  formatVariableRows,
} from "../variable-format";
import { isVariablesV2Enabled } from "../variables-v2";

export const environmentsRouter = router({
  // List all environments for a project
  list: orgProcedure
    .use(
      actionGuard("environment.read", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .input(listEnvironmentsInput)
    .output(makeResponseSchema(z.array(environmentOutput)))
    .query(async ({ ctx, input }) => {
      try {
        await assertProjectAccess(
          ctx.session.user.id,
          input.projectId,
          ctx.activeOrganizationId,
        );
      } catch {
        return respond({ message: "Project not found", data: [] });
      }

      const listWhere = activeEnvironmentWhere(
        eq(environment.projectId, input.projectId),
      );

      const environments = isVariablesV2Enabled()
        ? await db
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
              createdById: environment.createdBy,
              updatedById: environment.updatedBy,
            })
            .from(environment)
            .where(listWhere)
            .orderBy(environment.name)
        : await db
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
            .where(listWhere)
            .orderBy(environment.name);

      const data = await formatEnvironmentRows(environments);

      return respond({ message: "Environments fetched", data });
    }),

  // Get a single environment with its variables
  get: orgProcedure
    .use(
      actionGuard("environment.read", async (input) => {
        const id = (input as { id: string }).id;
        const projectId = await lookupProjectIdByEnvironmentId(id);
        if (!projectId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Environment not found",
          });
        }
        return { projectId };
      }),
    )
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
      try {
        await assertEnvironmentAccess(
          ctx.session.user.id,
          input.id,
          ctx.activeOrganizationId,
        );
      } catch {
        return respond({
          message: "Environment not found",
          data: { environment: null, variables: [] },
        });
      }

      const envWhere = activeEnvironmentWhere(eq(environment.id, input.id));

      const environmentData = isVariablesV2Enabled()
        ? await db
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
              createdById: environment.createdBy,
              updatedById: environment.updatedBy,
            })
            .from(environment)
            .innerJoin(project, eq(environment.projectId, project.id))
            .where(envWhere)
            .limit(1)
        : await db
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
            .where(envWhere)
            .limit(1);

      if (environmentData.length === 0) {
        return respond({
          message: "Environment not found",
          data: { environment: null, variables: [] },
        });
      }

      // Get variables for this environment
      const variablesWhere = activeEnvironmentVariableWhere(
        eq(environmentVariable.environmentId, input.id),
      );

      const variables = isVariablesV2Enabled()
        ? await db
            .select({
              id: environmentVariable.id,
              key: environmentVariable.key,
              environmentId: environmentVariable.environmentId,
              createdAt: environmentVariable.createdAt,
              updatedAt: environmentVariable.updatedAt,
              type: environmentVariable.type,
              note: environmentVariable.note,
              encryptedValue: environmentVariable.encryptedValue,
              createdById: environmentVariable.createdBy,
              updatedById: environmentVariable.updatedBy,
            })
            .from(environmentVariable)
            .where(variablesWhere)
            .orderBy(environmentVariable.key)
        : await db
            .select({
              id: environmentVariable.id,
              key: environmentVariable.key,
              environmentId: environmentVariable.environmentId,
              createdAt: environmentVariable.createdAt,
              updatedAt: environmentVariable.updatedAt,
            })
            .from(environmentVariable)
            .where(variablesWhere)
            .orderBy(environmentVariable.key);

      const environmentRecord = environmentData[0];

      if (!environmentRecord) {
        return respond({
          message: "Environment not found",
          data: { environment: null, variables: [] },
        });
      }

      const formattedEnvironment =
        await formatSingleEnvironment(environmentRecord);
      const formattedVariables = await formatVariableRows(variables);

      return respond({
        message: "Environment fetched",
        data: {
          environment: formattedEnvironment,
          variables: formattedVariables,
        },
      });
    }),

  // Create a new environment
  create: orgProcedure
    .use(
      actionGuard("environment.create", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .input(createEnvironmentInput)
    .output(makeResponseSchema(environmentOutput.nullable()))
    .mutation(async ({ ctx, input }) => {
      try {
        await assertProjectAccess(
          ctx.session.user.id,
          input.projectId,
          ctx.activeOrganizationId,
        );
      } catch {
        return respond({ message: "Project not found", data: null });
      }

      const name = normalizeEnvironmentName(input.name);
      const slug = input.slug || slugifyEnvironmentName(name);

      const duplicateName = await db
        .select({ id: environment.id })
        .from(environment)
        .where(
          activeEnvironmentWhere(
            and(
              eq(environment.projectId, input.projectId),
              sql`lower(trim(${environment.name})) = lower(${name})`,
            ),
          ),
        )
        .limit(1);

      if (duplicateName.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `An environment named "${name}" already exists in this project.`,
        });
      }

      const newEnvironment = await db
        .insert(environment)
        .values({
          id: crypto.randomUUID(),
          name,
          slug,
          branch: input.branch || null,
          deployedUrl: input.deployedUrl || null,
          status: input.status,
          isProduction: input.isProduction,
          description: input.description || null,
          projectId: input.projectId,
          ...(isVariablesV2Enabled()
            ? {
                createdBy: ctx.session.user.id,
                updatedBy: ctx.session.user.id,
              }
            : {}),
        })
        .returning();

      if (!newEnvironment[0]) {
        return respond({
          message: "Failed to create environment",
          data: null,
        });
      }

      await createAuditLog({
        userId: ctx.session.user.id,
        projectId: input.projectId,
        environmentId: newEnvironment[0].id,
        action: "CREATE",
        entityType: "ENVIRONMENT",
        entitySlug: newEnvironment[0].slug,
        newValue: JSON.stringify({ name: newEnvironment[0].name }),
      });

      const formatted = await formatSingleEnvironment({
        ...newEnvironment[0],
        createdById: newEnvironment[0].createdBy,
        updatedById: newEnvironment[0].updatedBy,
      });

      return respond({
        message: "Environment created",
        data: formatted,
      });
    }),

  // Update an environment
  update: orgProcedure
    .use(
      actionGuard("environment.update", async (input) => {
        const id = (input as { id: string }).id;
        const projectId = await lookupProjectIdByEnvironmentId(id);
        if (!projectId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Environment not found",
          });
        }
        return { projectId };
      }),
    )
    .input(updateEnvironmentInput)
    .output(makeResponseSchema(environmentOutput.nullable()))
    .mutation(async ({ ctx, input }) => {
      let access: { projectId: string };
      try {
        access = await assertEnvironmentAccess(
          ctx.session.user.id,
          input.id,
          ctx.activeOrganizationId,
        );
      } catch {
        return respond({ message: "Environment not found", data: null });
      }

      const existingEnvironment = await db
        .select()
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          activeEnvironmentWhere(
            and(eq(environment.id, input.id), eq(project.id, access.projectId)),
          ),
        )
        .limit(1);

      if (existingEnvironment.length === 0) {
        return respond({ message: "Environment not found", data: null });
      }

      const existing = existingEnvironment[0]?.environment;
      if (!existing) {
        return respond({ message: "Environment not found", data: null });
      }

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) {
        const name = assertValidEnvironmentName(input.name);
        const duplicateName = await db
          .select({ id: environment.id })
          .from(environment)
          .where(
            activeEnvironmentWhere(
              and(
                eq(environment.projectId, existing.projectId),
                sql`lower(trim(${environment.name})) = lower(${name})`,
                ne(environment.id, input.id),
              ),
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

      const updatedEnvironment = await db
        .update(environment)
        .set(updateData)
        .where(eq(environment.id, input.id))
        .returning();

      if (!updatedEnvironment[0]) {
        return respond({ message: "Failed to update environment", data: null });
      }

      await createAuditLog({
        userId: ctx.session.user.id,
        projectId: existing.projectId,
        environmentId: updatedEnvironment[0].id,
        action: "UPDATE",
        entityType: "ENVIRONMENT",
        entitySlug: updatedEnvironment[0].slug,
        newValue: JSON.stringify({ name: updatedEnvironment[0].name }),
      });

      const formatted = await formatSingleEnvironment({
        ...updatedEnvironment[0],
        createdById: updatedEnvironment[0].createdBy,
        updatedById: updatedEnvironment[0].updatedBy,
      });

      return respond({
        message: "Environment updated",
        data: formatted,
      });
    }),

  // Delete an environment (and all its variables)
  delete: orgProcedure
    .use(
      actionGuard("environment.delete", async (input) => {
        const id = (input as { id: string }).id;
        const projectId = await lookupProjectIdByEnvironmentId(id);
        if (!projectId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Environment not found",
          });
        }
        return { projectId };
      }),
    )
    .input(getEnvironmentInput)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await assertEnvironmentAccess(
          ctx.session.user.id,
          input.id,
          ctx.activeOrganizationId,
        );
      } catch {
        return { success: false };
      }

      const existingEnvironment = await db
        .select()
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(activeEnvironmentWhere(eq(environment.id, input.id)))
        .limit(1);

      if (existingEnvironment.length === 0) {
        return { success: false };
      }

      const envRecord = existingEnvironment[0]?.environment;
      const projectRecord = existingEnvironment[0]?.project;

      await softDeleteEnvironmentById(input.id, ctx.session.user.id);

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
