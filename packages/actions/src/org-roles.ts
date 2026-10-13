import type { OrgRole, StoredMemberRole } from "./types";

/** Normalize DB member.role (legacy `admin` → manager). */
export function normalizeOrgRole(
  role: string | null | undefined,
): OrgRole | null {
  if (!role) return null;
  if (role === "admin") return "manager";
  if (role === "owner" || role === "manager" || role === "member") {
    return role;
  }
  return "member";
}

export function isOrgRoleAtLeast(
  role: OrgRole | null,
  minimum: OrgRole,
): boolean {
  if (!role) return false;
  const rank: Record<OrgRole, number> = {
    owner: 3,
    manager: 2,
    member: 1,
  };
  return rank[role] >= rank[minimum];
}

export function storedRoleToOrgRole(role: StoredMemberRole): OrgRole {
  return normalizeOrgRole(role) ?? "member";
}
