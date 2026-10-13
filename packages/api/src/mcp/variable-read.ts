import { activeEnvironmentVariableWhere, db } from "@collidr/db";
import { environmentVariable } from "@collidr/db/schema/projects";
import { eq } from "drizzle-orm";
import { requireAction } from "../actions/require-action";
import { lookupProjectIdByEnvironmentId } from "../environment-access";
import { formatVariableRows } from "../variable-format";
import { isVariablesV2Enabled } from "../variables-v2";

export async function mcpVariableReadMetadata(
  userId: string,
  organizationId: string,
  variableId: string,
) {
  const [meta] = await db
    .select({ environmentId: environmentVariable.environmentId })
    .from(environmentVariable)
    .where(eq(environmentVariable.id, variableId))
    .limit(1);
  if (!meta) {
    throw new Error("variable_not_found");
  }
  const projectId = await lookupProjectIdByEnvironmentId(meta.environmentId);
  if (!projectId) {
    throw new Error("variable_not_found");
  }

  await requireAction("variable.read", {
    userId,
    organizationId,
    projectId,
  });

  const listWhere = activeEnvironmentVariableWhere(
    eq(environmentVariable.id, variableId),
  );

  const rows = isVariablesV2Enabled()
    ? await db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
          environmentId: environmentVariable.environmentId,
          createdAt: environmentVariable.createdAt,
          updatedAt: environmentVariable.updatedAt,
          type: environmentVariable.type,
          note: environmentVariable.note,
          createdById: environmentVariable.createdBy,
          updatedById: environmentVariable.updatedBy,
        })
        .from(environmentVariable)
        .where(listWhere)
        .limit(1)
    : await db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
          environmentId: environmentVariable.environmentId,
          createdAt: environmentVariable.createdAt,
          updatedAt: environmentVariable.updatedAt,
        })
        .from(environmentVariable)
        .where(listWhere)
        .limit(1);

  const formatted = await formatVariableRows(rows);
  const record = formatted[0];
  if (!record) {
    throw new Error("variable_not_found");
  }
  return record;
}
