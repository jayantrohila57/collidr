import { parseOrgMetadata } from "@/lib/org-slug";

/** Personal workspaces from backfill set metadata.type === "personal" (and backfill: true). */
export function isPersonalOrganization(org: {
  metadata?: string | Record<string, unknown> | null;
}): boolean {
  const meta = parseOrgMetadata(org.metadata ?? null);
  return meta.type === "personal";
}
