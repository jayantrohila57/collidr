export function isInviteMemberFormDirty(
  email: string,
  role: string,
  defaultRole = "member",
): boolean {
  return email.trim().length > 0 || role !== defaultRole;
}

export function isTeamCreateFormDirty(teamName: string): boolean {
  return teamName.trim().length > 0;
}

export function isOrganizationProfileEditDirty(
  draftName: string,
  draftSlug: string,
  savedName: string,
  savedSlug: string,
): boolean {
  return draftName !== savedName || draftSlug !== savedSlug;
}
