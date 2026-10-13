import { db } from "@collidr/db";
import { environmentVariable } from "@collidr/db/schema/projects";
import { isNull, sql } from "drizzle-orm";
import type { BulkVariableImportPlan } from "./bulk-import-variables-plan";

export type { BulkVariableImportPlan } from "./bulk-import-variables-plan";
export { planBulkVariableImport } from "./bulk-import-variables-plan";

export async function executeBulkVariableImport(
  environmentId: string,
  plan: BulkVariableImportPlan,
): Promise<void> {
  if (plan.insertRows.length === 0 && plan.updateRows.length === 0) {
    return;
  }

  await db.transaction(async (tx) => {
    if (plan.insertRows.length > 0) {
      await tx.insert(environmentVariable).values(
        plan.insertRows.map((row) => ({
          id: row.id,
          key: row.key,
          encryptedValue: row.encryptedValue,
          environmentId,
        })),
      );
    }

    if (plan.updateRows.length > 0) {
      await tx
        .insert(environmentVariable)
        .values(
          plan.updateRows.map((row) => ({
            id: row.id,
            key: row.key,
            encryptedValue: row.encryptedValue,
            environmentId,
          })),
        )
        .onConflictDoUpdate({
          target: [environmentVariable.environmentId, environmentVariable.key],
          targetWhere: isNull(environmentVariable.deletedAt),
          set: {
            encryptedValue: sql`excluded.encrypted_value`,
          },
        });
    }
  });
}
