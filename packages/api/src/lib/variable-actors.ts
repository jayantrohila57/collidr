import { db } from "@env-manager/db";
import { user } from "@env-manager/db/schema/auth";
import { inArray } from "drizzle-orm";

export type VariableActor = {
  id: string;
  name: string;
  image: string | null;
};

export async function attachUpdatedByUsers<
  T extends { updatedBy?: string | null },
>(rows: T[]): Promise<Array<T & { updatedByUser: VariableActor | null }>> {
  const actors = await loadVariableActors(rows.map((row) => row.updatedBy));
  return rows.map((row) => ({
    ...row,
    updatedByUser: row.updatedBy ? (actors.get(row.updatedBy) ?? null) : null,
  }));
}

export async function loadVariableActors(
  userIds: Array<string | null | undefined>,
): Promise<Map<string, VariableActor>> {
  const unique = [
    ...new Set(userIds.filter((id): id is string => Boolean(id))),
  ];
  if (unique.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
    })
    .from(user)
    .where(inArray(user.id, unique));

  return new Map(rows.map((row) => [row.id, row]));
}
