import { count, eq } from "drizzle-orm";
import { db } from "./index";
import { member } from "./schema/organization";
import { project } from "./schema/projects";

function parseMetadata(
  metadata: string | Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!metadata) return {};
  if (typeof metadata === "object") return metadata;
  try {
    return JSON.parse(metadata) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function assertOrganizationCanBeDeleted(
  org: {
    id: string;
    slug: string;
    metadata?: string | Record<string, unknown> | null;
  },
  userId: string,
): Promise<void> {
  const meta = parseMetadata(org.metadata ?? null);
  if (meta.type === "personal") {
    throw new Error(
      "Your personal workspace cannot be deleted. Create another organization first if you need a separate team space.",
    );
  }

  const [{ value: membershipCount }] = await db
    .select({ value: count() })
    .from(member)
    .where(eq(member.userId, userId));

  if ((membershipCount ?? 0) <= 1) {
    throw new Error(
      "You cannot delete your only organization. Create another one first or leave this organization after joining another.",
    );
  }

  const [{ value: projectCount }] = await db
    .select({ value: count() })
    .from(project)
    .where(eq(project.organizationId, org.id));

  if ((projectCount ?? 0) > 0) {
    throw new Error(
      "This organization still has projects. Move or delete them before deleting the organization.",
    );
  }
}
