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
