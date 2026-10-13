export type OrganizationInvitationRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date | string;
};

export function isPendingInvitationStatus(status: string | undefined): boolean {
  return status?.toLowerCase() === "pending";
}

export function parseOrganizationInvitations(
  data: unknown,
): OrganizationInvitationRow[] {
  if (Array.isArray(data)) {
    return data as OrganizationInvitationRow[];
  }
  if (data && typeof data === "object") {
    const nested = (data as { invitations?: unknown }).invitations;
    if (Array.isArray(nested)) {
      return nested as OrganizationInvitationRow[];
    }
  }
  return [];
}

export function countPendingInvitations(
  invitations: readonly { status?: string }[],
): number {
  return invitations.filter((invite) =>
    isPendingInvitationStatus(invite.status),
  ).length;
}

export function pendingOrganizationInvitations(
  invitations: readonly OrganizationInvitationRow[],
): OrganizationInvitationRow[] {
  return invitations.filter((invite) =>
    isPendingInvitationStatus(invite.status),
  );
}
