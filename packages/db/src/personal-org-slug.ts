/** Stable slug for a user's personal workspace (backfill + E2E). */
export function slugifyPersonal(userId: string, name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = userId.replace(/-/g, "").slice(0, 8);
  return `${base || "workspace"}-personal-${suffix}`.slice(0, 255);
}
