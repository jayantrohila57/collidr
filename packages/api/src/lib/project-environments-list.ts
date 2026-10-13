import { db } from "@env-manager/db";
import { environment } from "@env-manager/db/schema/projects";
import { eq } from "drizzle-orm";
import { loadVariableActors } from "./variable-actors";
import { isVariablesV2Enabled } from "./variables-v2";

const environmentBaseSelect = {
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
};

export async function listEnvironmentsForProject(projectId: string) {
  const v2 = isVariablesV2Enabled();

  if (!v2) {
    return db
      .select(environmentBaseSelect)
      .from(environment)
      .where(eq(environment.projectId, projectId))
      .orderBy(environment.name);
  }

  const rows = await db
    .select({
      ...environmentBaseSelect,
      createdBy: environment.createdBy,
      updatedBy: environment.updatedBy,
    })
    .from(environment)
    .where(eq(environment.projectId, projectId))
    .orderBy(environment.name);

  const actors = await loadVariableActors(
    rows.flatMap((row) => [row.createdBy, row.updatedBy]),
  );

  return rows.map((row) => ({
    ...row,
    createdByUser: row.createdBy ? (actors.get(row.createdBy) ?? null) : null,
  }));
}
