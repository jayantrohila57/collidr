import { activeProjectWhere, db } from "@env-manager/db";
import { project } from "@env-manager/db/schema/projects";
import { eq } from "drizzle-orm";

export function slugifyProjectName(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug;
}

export function buildProjectSlugFromName(name: string): string {
  const slug = slugifyProjectName(name.trim());
  if (slug.length > 0) {
    return slug.slice(0, 255);
  }
  return `project-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

export async function ensureUniqueProjectSlug(
  baseSlug: string,
  excludeProjectId?: string,
): Promise<string> {
  let candidate = baseSlug.slice(0, 255);
  let suffix = 1;

  while (suffix < 10_000) {
    const existing = await db
      .select({ id: project.id })
      .from(project)
      .where(activeProjectWhere(eq(project.slug, candidate)))
      .limit(1);

    const taken = existing[0];
    if (!taken || (excludeProjectId && taken.id === excludeProjectId)) {
      return candidate;
    }

    const suffixStr = `-${suffix}`;
    const trimmedBase = baseSlug.slice(0, Math.max(1, 255 - suffixStr.length));
    candidate = `${trimmedBase}${suffixStr}`;
    suffix += 1;
  }

  return `project-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}
