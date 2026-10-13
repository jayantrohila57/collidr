import { decrypt, encrypt } from "@env-manager/crypto";
import { db } from "@env-manager/db";
import {
  environment,
  environmentVariable,
  project,
} from "@env-manager/db/schema/projects";
import { TRPCError } from "@trpc/server";
import { and, count, eq, inArray } from "drizzle-orm";
import { z } from "zod/v3";
import { createAuditLog, getProjectEnvironmentIds } from "../audit";
import { throwFriendlyError } from "../errors";
import { protectedProcedure, router } from "../index";
import {
  bulkImportResultOutput,
  bulkImportVariablesInput,
  createVariableInput,
  exportVariablesInput,
  exportVariablesOutput,
  getVariableInput,
  makeResponseSchema,
  respond,
  updateVariableInput,
  variableOutput,
  variableWithDecryptedValueOutput,
} from "../validation";

export const environmentVariablesRouter = router({
  // List variables for an environment (metadata only)
  list: protectedProcedure
    .input(z.object({ environmentId: z.string().uuid() }))
    .output(makeResponseSchema(z.array(variableOutput)))
    .query(async ({ ctx, input }) => {
      // Verify ownership through project
      const hasAccess = await db
        .select({ id: environment.id })
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          and(
            eq(environment.id, input.environmentId),
            eq(project.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (!hasAccess.length) {
        return respond({ message: "Environment not found", data: [] });
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
        .where(eq(environmentVariable.environmentId, input.environmentId))
        .orderBy(environmentVariable.key);

      return respond({ message: "Variables fetched", data: variables });
    }),

  countsByEnvironment: protectedProcedure
    .input(
      z.object({
        environmentIds: z.array(z.string().uuid()).max(64),
      }),
    )
    .output(makeResponseSchema(z.record(z.string(), z.number())))
    .query(async ({ ctx, input }) => {
      if (input.environmentIds.length === 0) {
        return respond({ message: "Counts fetched", data: {} });
      }

      const allowed = await db
        .select({ id: environment.id })
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          and(
            inArray(environment.id, input.environmentIds),
            eq(project.userId, ctx.session.user.id),
          ),
        );

      const allowedIds = allowed.map((row) => row.id);
      if (allowedIds.length === 0) {
        return respond({ message: "Counts fetched", data: {} });
      }

      const rows = await db
        .select({
          environmentId: environmentVariable.environmentId,
          total: count(),
        })
        .from(environmentVariable)
        .where(inArray(environmentVariable.environmentId, allowedIds))
        .groupBy(environmentVariable.environmentId);

      const data: Record<string, number> = {};
      for (const id of allowedIds) {
        data[id] = 0;
      }
      for (const row of rows) {
        data[row.environmentId] = row.total;
      }

      return respond({ message: "Counts fetched", data });
    }),

  // Get a single variable with decrypted value
  get: protectedProcedure
    .input(getVariableInput)
    .output(makeResponseSchema(variableWithDecryptedValueOutput.nullable()))
    .query(async ({ ctx, input }) => {
      const data = await db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
          encryptedValue: environmentVariable.encryptedValue,
          environmentId: environmentVariable.environmentId,
          createdAt: environmentVariable.createdAt,
          updatedAt: environmentVariable.updatedAt,
        })
        .from(environmentVariable)
        .innerJoin(
          environment,
          eq(environmentVariable.environmentId, environment.id),
        )
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          and(
            eq(environmentVariable.id, input.id),
            eq(project.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      const record = data[0];
      if (!record) {
        return respond({ message: "Variable not found", data: null });
      }

      return respond({
        message: "Variable fetched",
        data: {
          ...record,
          value: decrypt(record.encryptedValue),
        },
      });
    }),

  // Create a new variable
  create: protectedProcedure
    .input(createVariableInput)
    .output(makeResponseSchema(variableOutput.nullable()))
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the environment
      const hasAccess = await db
        .select({ id: environment.id })
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          and(
            eq(environment.id, input.environmentId),
            eq(project.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (!hasAccess.length) {
        return respond({ message: "Environment not found", data: null });
      }

      const normalizedKey = input.key.trim().toUpperCase();

      const duplicate = await db
        .select({ id: environmentVariable.id })
        .from(environmentVariable)
        .where(
          and(
            eq(environmentVariable.environmentId, input.environmentId),
            eq(environmentVariable.key, normalizedKey),
          ),
        )
        .limit(1);

      if (duplicate.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Variable "${normalizedKey}" already exists in this environment.`,
        });
      }

      let newVariable: typeof environmentVariable.$inferSelect | undefined;
      try {
        [newVariable] = await db
          .insert(environmentVariable)
          .values({
            id: crypto.randomUUID(),
            key: normalizedKey,
            encryptedValue: encrypt(input.value),
            environmentId: input.environmentId,
          })
          .returning();
      } catch (error) {
        throwFriendlyError(error, {
          fallback: "Unable to save this variable. Please try again.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      if (!newVariable) {
        return respond({ message: "Failed to create variable", data: null });
      }

      // Create audit log
      const envDetails = await getProjectEnvironmentIds(input.environmentId);
      if (envDetails) {
        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: envDetails.projectId,
          environmentId: envDetails.environmentId,
          variableId: newVariable.id,
          action: "CREATE",
          entityType: "VARIABLE",
          newValue: JSON.stringify({
            key: normalizedKey,
          }),
        });
      }

      return respond({ message: "Variable created", data: newVariable });
    }),

  // Update a variable
  update: protectedProcedure
    .input(updateVariableInput)
    .output(makeResponseSchema(variableOutput.nullable()))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
          encryptedValue: environmentVariable.encryptedValue,
          environmentId: environmentVariable.environmentId,
        })
        .from(environmentVariable)
        .innerJoin(
          environment,
          eq(environmentVariable.environmentId, environment.id),
        )
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          and(
            eq(environmentVariable.id, input.id),
            eq(project.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (!existing.length) {
        return respond({ message: "Variable not found", data: null });
      }

      const existingVar = existing[0];
      if (!existingVar) {
        return respond({ message: "Variable not found", data: null });
      }

      const oldValue = {
        key: existingVar.key,
        value: decrypt(existingVar.encryptedValue),
      };

      const normalizedKey = input.key?.trim().toUpperCase();

      if (normalizedKey && normalizedKey !== existingVar.key) {
        const duplicate = await db
          .select({ id: environmentVariable.id })
          .from(environmentVariable)
          .where(
            and(
              eq(environmentVariable.environmentId, existingVar.environmentId),
              eq(environmentVariable.key, normalizedKey),
            ),
          )
          .limit(1);

        if (duplicate.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Variable "${normalizedKey}" already exists in this environment.`,
          });
        }
      }

      const updateData: {
        key?: string;
        encryptedValue?: string;
      } = {};
      if (normalizedKey) updateData.key = normalizedKey;
      if (input.value !== undefined) {
        updateData.encryptedValue = encrypt(input.value);
      }

      const [updated] = await db
        .update(environmentVariable)
        .set(updateData)
        .where(eq(environmentVariable.id, input.id))
        .returning();

      if (!updated) {
        return respond({ message: "Failed to update variable", data: null });
      }

      // Create audit log
      const envDetails = await getProjectEnvironmentIds(
        existingVar.environmentId,
      );
      if (envDetails) {
        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: envDetails.projectId,
          environmentId: envDetails.environmentId,
          variableId: input.id,
          action: "UPDATE",
          entityType: "VARIABLE",
          oldValue: JSON.stringify(oldValue),
          newValue: JSON.stringify({
            key: normalizedKey || existingVar.key,
          }),
        });
      }

      return respond({ message: "Variable updated", data: updated });
    }),

  // Delete a variable
  delete: protectedProcedure
    .input(getVariableInput)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
          encryptedValue: environmentVariable.encryptedValue,
          environmentId: environmentVariable.environmentId,
        })
        .from(environmentVariable)
        .innerJoin(
          environment,
          eq(environmentVariable.environmentId, environment.id),
        )
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          and(
            eq(environmentVariable.id, input.id),
            eq(project.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (!existing.length) {
        return { success: false };
      }

      const existingVar = existing[0];
      if (!existingVar) {
        return { success: false };
      }

      // Create audit log before deletion
      const envDetails = await getProjectEnvironmentIds(
        existingVar.environmentId,
      );
      if (envDetails) {
        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: envDetails.projectId,
          environmentId: envDetails.environmentId,
          variableId: input.id,
          action: "DELETE",
          entityType: "VARIABLE",
          oldValue: JSON.stringify({
            key: existingVar.key,
            value: decrypt(existingVar.encryptedValue),
          }),
        });
      }

      await db
        .delete(environmentVariable)
        .where(eq(environmentVariable.id, input.id));

      return { success: true };
    }),

  // Bulk import variables (supports .env file style imports)
  bulkImport: protectedProcedure
    .input(bulkImportVariablesInput)
    .output(makeResponseSchema(bulkImportResultOutput))
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the environment
      const hasAccess = await db
        .select({ id: environment.id })
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          and(
            eq(environment.id, input.environmentId),
            eq(project.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (!hasAccess.length) {
        return respond({
          message: "Environment not found",
          data: { created: 0, updated: 0, skipped: 0 },
        });
      }

      // Get existing variables for this environment
      const existingVars = await db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
        })
        .from(environmentVariable)
        .where(eq(environmentVariable.environmentId, input.environmentId));

      const existingKeyMap = new Map(existingVars.map((v) => [v.key, v.id]));

      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const variable of input.variables) {
        const existingId = existingKeyMap.get(variable.key);

        if (existingId) {
          if (input.overwrite) {
            await db
              .update(environmentVariable)
              .set({ encryptedValue: encrypt(variable.value) })
              .where(eq(environmentVariable.id, existingId));
            updated++;
          } else {
            skipped++;
          }
        } else {
          await db.insert(environmentVariable).values({
            id: crypto.randomUUID(),
            key: variable.key,
            encryptedValue: encrypt(variable.value),
            environmentId: input.environmentId,
          });
          created++;
        }
      }

      // Create audit log for bulk import
      const envDetails = await getProjectEnvironmentIds(input.environmentId);
      if (envDetails) {
        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: envDetails.projectId,
          environmentId: envDetails.environmentId,
          action: "BULK_IMPORT",
          entityType: "VARIABLE",
          newValue: JSON.stringify({
            variables: input.variables,
            overwrite: input.overwrite,
            result: { created, updated, skipped },
          }),
        });
      }

      return respond({
        message: `Imported ${created} new, updated ${updated}, skipped ${skipped} variables`,
        data: { created, updated, skipped },
      });
    }),

  // Export variables as .env format string
  export: protectedProcedure
    .input(exportVariablesInput)
    .output(makeResponseSchema(exportVariablesOutput))
    .query(async ({ ctx, input }) => {
      // Verify user owns the environment
      const hasAccess = await db
        .select({ id: environment.id })
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          and(
            eq(environment.id, input.environmentId),
            eq(project.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (!hasAccess.length) {
        return respond({ message: "Environment not found", data: "" });
      }

      const variables = await db
        .select({
          key: environmentVariable.key,
          encryptedValue: environmentVariable.encryptedValue,
        })
        .from(environmentVariable)
        .where(eq(environmentVariable.environmentId, input.environmentId))
        .orderBy(environmentVariable.key);

      // Format as .env file (KEY=value with proper escaping)
      const envContent = variables
        .map((v) => {
          const decryptedValue = decrypt(v.encryptedValue);
          // Escape special characters and wrap in quotes if needed
          const needsQuotes =
            decryptedValue.includes(" ") ||
            decryptedValue.includes('"') ||
            decryptedValue.includes("'") ||
            decryptedValue.includes("\n") ||
            decryptedValue.includes("#");

          if (needsQuotes) {
            // Use double quotes and escape inner double quotes
            const escaped = decryptedValue
              .replace(/\\/g, "\\\\")
              .replace(/"/g, '\\"')
              .replace(/\n/g, "\\n");
            return `${v.key}="${escaped}"`;
          }
          return `${v.key}=${decryptedValue}`;
        })
        .join("\n");

      // Create audit log for export
      const envDetails = await getProjectEnvironmentIds(input.environmentId);
      if (envDetails) {
        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: envDetails.projectId,
          environmentId: envDetails.environmentId,
          action: "EXPORT",
          entityType: "VARIABLE",
          newValue: JSON.stringify({
            variablesCount: variables.length,
          }),
        });
      }

      return respond({
        message: `Exported ${variables.length} variables`,
        data: envContent,
      });
    }),
});
