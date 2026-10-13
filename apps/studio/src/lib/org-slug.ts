/** Live slug field: lowercase and allowed chars only (keeps trailing hyphen while typing). */
export function normalizeOrgSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-");
}

export function slugifyOrganizationName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export function formatOrganizationCreateError(
  message: string | undefined,
): string {
  if (!message) return "Could not create organization";
  const lower = message.toLowerCase();
  if (
    lower.includes("already exists") ||
    lower.includes("organization_already_exists")
  ) {
    return "That slug is already taken. Choose a different slug.";
  }
  return message;
}

export function parseOrgMetadata(
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

export function normalizeOrgSlugForCompare(slug: string): string {
  return slugifyOrganizationName(slug);
}

export function resolveOrgSlugForSave(
  currentInput: string,
  initialSlug: string,
): string {
  const trimmed = currentInput.trim();
  if (
    normalizeOrgSlugForCompare(trimmed) ===
    normalizeOrgSlugForCompare(initialSlug)
  ) {
    return initialSlug;
  }
  return slugifyOrganizationName(trimmed);
}
