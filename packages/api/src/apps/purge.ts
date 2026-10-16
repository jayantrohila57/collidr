import { db } from "@loftlancer/db";
import { projectApp, task } from "@loftlancer/db/schema/project-app";
import {
  environment,
  environmentVariable,
} from "@loftlancer/db/schema/projects";
import { and, eq, inArray, isNotNull, lte } from "drizzle-orm";

/**
 * Apps retention purge (#257). Uninstalled apps keep their data for 30 days
 * (`purge_after`); after that this hard-deletes the app's data for that
 * project and marks the install row `purged`. Idempotent: a purged row is
 * never selected again, and every delete is scoped to one project.
 */
export type PurgeCandidate = {
  id: string;
  appId: string;
  projectId: string;
  status: string;
  purgeAfter: Date | null;
};

export function selectPurgeable(
  rows: PurgeCandidate[],
  now: Date,
): PurgeCandidate[] {
  return rows.filter(
    (r) =>
      r.status === "uninstalled" &&
      r.purgeAfter !== null &&
      r.purgeAfter.getTime() <= now.getTime(),
  );
}

export type PurgeDeps = {
  listCandidates: (now: Date, limit: number) => Promise<PurgeCandidate[]>;
  deleteAppData: (appId: string, projectId: string) => Promise<number>;
  markPurged: (id: string, now: Date) => Promise<boolean>;
};

export async function purgeExpiredApps(
  deps: PurgeDeps,
  now = new Date(),
  limit = 200,
) {
  const due = selectPurgeable(await deps.listCandidates(now, limit), now);
  const purged: { appId: string; projectId: string; rows: number }[] = [];
  for (const row of due) {
    const rows = await deps.deleteAppData(row.appId, row.projectId);
    // Only count it if we flipped uninstalled -> purged (guards concurrent runs).
    if (await deps.markPurged(row.id, now))
      purged.push({ appId: row.appId, projectId: row.projectId, rows });
  }
  return { checked: due.length, purged };
}

async function deleteAppData(
  appId: string,
  projectId: string,
): Promise<number> {
  if (appId === "tasks") {
    // task_comment rows cascade from task.
    const res = await db
      .delete(task)
      .where(eq(task.projectId, projectId))
      .returning({ id: task.id });
    return res.length;
  }
  if (appId === "env") {
    const envs = await db
      .select({ id: environment.id })
      .from(environment)
      .where(eq(environment.projectId, projectId));
    const ids = envs.map((e) => e.id);
    if (ids.length === 0) return 0;
    const vars = await db
      .delete(environmentVariable)
      .where(inArray(environmentVariable.environmentId, ids))
      .returning({ id: environmentVariable.id });
    await db.delete(environment).where(inArray(environment.id, ids));
    return vars.length + ids.length;
  }
  return 0;
}

export const dbPurgeDeps: PurgeDeps = {
  listCandidates: (now, limit) =>
    db
      .select({
        id: projectApp.id,
        appId: projectApp.appId,
        projectId: projectApp.projectId,
        status: projectApp.status,
        purgeAfter: projectApp.purgeAfter,
      })
      .from(projectApp)
      .where(
        and(
          eq(projectApp.status, "uninstalled"),
          isNotNull(projectApp.purgeAfter),
          lte(projectApp.purgeAfter, now),
        ),
      )
      .limit(limit),
  deleteAppData,
  markPurged: async (id, now) => {
    const res = await db
      .update(projectApp)
      .set({ status: "purged", settings: {}, updatedAt: now })
      .where(and(eq(projectApp.id, id), eq(projectApp.status, "uninstalled")))
      .returning({ id: projectApp.id });
    return res.length > 0;
  },
};
