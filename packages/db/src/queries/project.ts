import { and, eq } from "drizzle-orm";

import { db } from "../client";
import { project } from "../schema/projects";

export async function getOwnedProjectBySlug(userId: string, slug: string) {
  const rows = await db
    .select({
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
    })
    .from(project)
    .where(and(eq(project.slug, slug), eq(project.userId, userId)))
    .limit(1);

  return rows[0] ?? null;
}
