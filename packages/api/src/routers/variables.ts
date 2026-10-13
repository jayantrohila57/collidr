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
import { attachUpdatedByUsers } from "../lib/variable-actors";
import { isVariablesV2Enabled } from "../lib/variables-v2";
import {
  batchCreateVariablesInput,
  batchCreateVariablesResultOutput,
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
      const v2 = isVariablesV2Enabled();

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

      if (!v2) {
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
        .where(eq(environmentVariable.environmentId, input.environmentId))
        .orderBy(environmentVariable.key);

      const data = await attachUpdatedByUsers(variables);

      return respond({ message: "Variables fetched", data });
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
      const v2 = isVariablesV2Enabled();
      const access = and(
        eq(environmentVariable.id, input.id),
        eq(project.userId, ctx.session.user.id),
      );

      if (!v2) {
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
          .where(access)
          .limit(1);

        const record = data[0];
        if (!record) {
          return respond({ message: "Variable not found", data: null });
        }

        const { encryptedValue, ...rest } = record;
        return respond({
          message: "Variable fetched",
          data: {
            ...rest,
            value: decrypt(encryptedValue),
          },
        });
      }

      const data = await db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
          encryptedValue: environmentVariable.encryptedValue,
          environmentId: environmentVariable.environmentId,
          createdAt: environmentVariable.createdAt,
          updatedAt: environmentVariable.updatedAt,
          type: environmentVariable.type,
          note: environmentVariable.note,
          createdBy: environmentVariable.createdBy,
          updatedBy: environmentVariable.updatedBy,
        })
        .from(environmentVariable)
        .innerJoin(
          environment,
          eq(environmentVariable.environmentId, environment.id),
        )
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(access)
        .limit(1);

      const record = data[0];
      if (!record) {
        return respond({ message: "Variable not found", data: null });
      }

      if (record.type === "secret") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Secret values cannot be revealed after saving. Overwrite with a new value instead.",
        });
      }

      const { encryptedValue, ...rest } = record;
      const withActors = (await attachUpdatedByUsers([rest]))[0];

      return respond({
        message: "Variable fetched",
        data: {
          ...withActors,
          value: decrypt(encryptedValue),
        },
      });
    }),

  batchCreate: protectedProcedure
    .input(batchCreateVariablesInput)
    .output(makeResponseSchema(batchCreateVariablesResultOutput))
    .mutation(async ({ ctx, input }) => {
      if (!isVariablesV2Enabled()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Variables v2 is not enabled on this server.",
        });
      }

      const ownedEnvs = await db
        .select({ id: environment.id })
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id))
        .where(
          and(
            eq(project.id, input.projectId),
            eq(project.userId, ctx.session.user.id),
            inArray(environment.id, input.environmentIds),
          ),
        );

      const allowedIds = new Set(ownedEnvs.map((row) => row.id));
      if (allowedIds.size !== input.environmentIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more environments were not found.",
        });
      }

      const userId = ctx.session.user.id;
      let created = 0;

      for (const environmentId of input.environmentIds) {
        for (const variable of input.variables) {
          const normalizedKey = variable.key.trim().toUpperCase();

          const duplicate = await db
            .select({ id: environmentVariable.id })
            .from(environmentVariable)
            .where(
              and(
                eq(environmentVariable.environmentId, environmentId),
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

          await db.insert(environmentVariable).values({
            id: crypto.randomUUID(),
            key: normalizedKey,
            encryptedValue: encrypt(variable.value),
            environmentId,
            type: variable.type,
            note: variable.note ?? null,
            createdBy: userId,
            updatedBy: userId,
          });
          created++;
        }
      }

      return respond({
        message: `Created ${created} variable(s) across ${input.environmentIds.length} environment(s)`,
        data: {
          created,
          environments: input.environmentIds.length,
        },
      });
    }),

  // Create a new variable
  create: protectedProcedure
    .input(createVariableInput)
    .output(makeResponseSchema(variableOutput.nullable()))
    .mutation(async ({ ctx, input }) => {
      const v2 = isVariablesV2Enabled();

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

      const userId = ctx.session.user.id;
      const newId = crypto.randomUUID();

      try {
        if (!v2) {
          const [newVariable] = await db
            .insert(environmentVariable)
            .values({
              id: newId,
              key: normalizedKey,
              encryptedValue: encrypt(input.value),
              environmentId: input.environmentId,
            })
            .returning({
              id: environmentVariable.id,
              key: environmentVariable.key,
              environmentId: environmentVariable.environmentId,
              createdAt: environmentVariable.createdAt,
              updatedAt: environmentVariable.updatedAt,
            });

          if (!newVariable) {
            return respond({
              message: "Failed to create variable",
              data: null,
            });
          }

          const envDetails = await getProjectEnvironmentIds(
            input.environmentId,
          );
          if (envDetails) {
            await createAuditLog({
              userId: ctx.session.user.id,
              projectId: envDetails.projectId,
              environmentId: envDetails.environmentId,
              variableId: newVariable.id,
              action: "CREATE",
              entityType: "VARIABLE",
              newValue: JSON.stringify({ key: normalizedKey }),
            });
          }

          return respond({ message: "Variable created", data: newVariable });
        }

        const [newVariable] = await db
          .insert(environmentVariable)
          .values({
            id: newId,
            key: normalizedKey,
            encryptedValue: encrypt(input.value),
            environmentId: input.environmentId,
            type: input.type ?? "secret",
            note: input.note ?? null,
            createdBy: userId,
            updatedBy: userId,
          })
          .returning({
            id: environmentVariable.id,
            key: environmentVariable.key,
            environmentId: environmentVariable.environmentId,
            createdAt: environmentVariable.createdAt,
            updatedAt: environmentVariable.updatedAt,
            type: environmentVariable.type,
            note: environmentVariable.note,
            createdBy: environmentVariable.createdBy,
            updatedBy: environmentVariable.updatedBy,
          });

        if (!newVariable) {
          return respond({ message: "Failed to create variable", data: null });
        }

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
              type: input.type ?? "secret",
            }),
          });
        }

        const data = (await attachUpdatedByUsers([newVariable]))[0];
        return respond({ message: "Variable created", data });
      } catch (error) {
        throwFriendlyError(error, {
          fallback: "Unable to save this variable. Please try again.",
          code: "INTERNAL_SERVER_ERROR",
        });
        return respond({ message: "Failed to create variable", data: null });
      }
    }),

  // Update a variable
  update: protectedProcedure
    .input(updateVariableInput)
    .output(makeResponseSchema(variableOutput.nullable()))
    .mutation(async ({ ctx, input }) => {
      const v2 = isVariablesV2Enabled();

      const existing = v2
        ? await db
            .select({
              id: environmentVariable.id,
              key: environmentVariable.key,
              encryptedValue: environmentVariable.encryptedValue,
              environmentId: environmentVariable.environmentId,
              type: environmentVariable.type,
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
            .limit(1)
        : await db
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
        value:
          v2 && "type" in existingVar && existingVar.type === "secret"
            ? "[hidden]"
            : decrypt(existingVar.encryptedValue),
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
        note?: string | null;
        type?: "secret" | "config";
        updatedBy?: string;
      } = {};
      if (normalizedKey) updateData.key = normalizedKey;
      if (input.value !== undefined && input.value !== "") {
        updateData.encryptedValue = encrypt(input.value);
      }
      if (v2) {
        if (input.note !== undefined) updateData.note = input.note;
        if (input.type !== undefined) updateData.type = input.type;
        updateData.updatedBy = ctx.session.user.id;
      }

      if (!v2) {
        const [updated] = await db
          .update(environmentVariable)
          .set(updateData)
          .where(eq(environmentVariable.id, input.id))
          .returning({
            id: environmentVariable.id,
            key: environmentVariable.key,
            environmentId: environmentVariable.environmentId,
            createdAt: environmentVariable.createdAt,
            updatedAt: environmentVariable.updatedAt,
          });

        if (!updated) {
          return respond({ message: "Failed to update variable", data: null });
        }

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
      }

      const [updated] = await db
        .update(environmentVariable)
        .set(updateData)
        .where(eq(environmentVariable.id, input.id))
        .returning({
          id: environmentVariable.id,
          key: environmentVariable.key,
          environmentId: environmentVariable.environmentId,
          createdAt: environmentVariable.createdAt,
          updatedAt: environmentVariable.updatedAt,
          type: environmentVariable.type,
          note: environmentVariable.note,
          createdBy: environmentVariable.createdBy,
          updatedBy: environmentVariable.updatedBy,
        });

      if (!updated) {
        return respond({ message: "Failed to update variable", data: null });
      }

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

      const data = (await attachUpdatedByUsers([updated]))[0];
      return respond({ message: "Variable updated", data });
    }),

  // Delete a variable
  delete: protectedProcedure
    .input(getVariableInput)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const v2 = isVariablesV2Enabled();

      const existing = v2
        ? await db
            .select({
              id: environmentVariable.id,
              key: environmentVariable.key,
              encryptedValue: environmentVariable.encryptedValue,
              environmentId: environmentVariable.environmentId,
              type: environmentVariable.type,
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
            .limit(1)
        : await db
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
            value:
              v2 && "type" in existingVar && existingVar.type === "secret"
                ? "[hidden]"
                : decrypt(existingVar.encryptedValue),
          }),
        });
      }

      await db
        .delete(environmentVariable)
        .where(eq(environmentVariable.id, input.id));

      return { success: true };
    }),

  bulkImport: protectedProcedure
    .input(bulkImportVariablesInput)
    .output(makeResponseSchema(bulkImportResultOutput))
    .mutation(async ({ ctx, input }) => {
      if (isVariablesV2Enabled()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            ".env import is not available while Variables v2 is enabled.",
        });
      }

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

  export: protectedProcedure
    .input(exportVariablesInput)
    .output(makeResponseSchema(exportVariablesOutput))
    .query(async ({ ctx, input }) => {
      const v2 = isVariablesV2Enabled();

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

      const variables = v2
        ? await db
            .select({
              key: environmentVariable.key,
              encryptedValue: environmentVariable.encryptedValue,
              type: environmentVariable.type,
            })
            .from(environmentVariable)
            .where(eq(environmentVariable.environmentId, input.environmentId))
            .orderBy(environmentVariable.key)
        : await db
            .select({
              key: environmentVariable.key,
              encryptedValue: environmentVariable.encryptedValue,
            })
            .from(environmentVariable)
            .where(eq(environmentVariable.environmentId, input.environmentId))
            .orderBy(environmentVariable.key);

      const envContent = variables
        .map((v) => {
          if (v2 && "type" in v && v.type === "secret") {
            return `${v.key}=`;
          }
          const decryptedValue = decrypt(v.encryptedValue);
          const needsQuotes =
            decryptedValue.includes(" ") ||
            decryptedValue.includes('"') ||
            decryptedValue.includes("'") ||
            decryptedValue.includes("\n") ||
            decryptedValue.includes("#");

          if (needsQuotes) {
            const escaped = decryptedValue
              .replace(/\\/g, "\\\\")
              .replace(/"/g, '\\"')
              .replace(/\n/g, "\\n");
            return `${v.key}="${escaped}"`;
          }
          return `${v.key}=${decryptedValue}`;
        })
        .join("\n");

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
