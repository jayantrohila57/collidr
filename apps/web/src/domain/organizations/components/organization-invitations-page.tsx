"use client";

import { useCallback, useEffect, useState } from "react";
import { invitationsEmpty } from "@/components/data-table/data-table-empty-presets";
import { AppIcon } from "@/components/patterns/app-icon";
import { RoleBadge } from "@/components/patterns/status-badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Can } from "@/domain/permissions/components/can";
import { authClient } from "@/lib/auth-client";
import { formatDateTime } from "@/lib/format";
import {
  isPendingInvitationStatus,
  type OrganizationInvitationRow,
  parseOrganizationInvitations,
} from "@/lib/organization-invitations";
import { toast } from "@/lib/toast";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { InviteMemberSheet } from "./invite-member-sheet";
import { OrganizationSectionPage } from "./organization-section-page";

export function OrganizationInvitationsPage({ slug }: { slug: string }) {
  const { organization, status: orgStatus } = useOrganizationBySlug(slug);
  const [invitations, setInvitations] = useState<OrganizationInvitationRow[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadInvitations = useCallback(async (organizationId: string) => {
    setLoading(true);
    try {
      const result = await authClient.organization.listInvitations({
        query: { organizationId },
      });
      const listed = parseOrganizationInvitations(result.data);
      if (listed.length > 0) {
        setInvitations(listed);
        return;
      }
      const full = await authClient.organization.getFullOrganization({
        query: { organizationId },
      });
      setInvitations(
        parseOrganizationInvitations(
          (full.data as { invitations?: unknown } | null)?.invitations,
        ),
      );
    } catch {
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!organization?.id) return;
    void loadInvitations(organization.id);
  }, [organization?.id, loadInvitations]);

  const revokeInvitation = async (invitationId: string) => {
    if (!organization?.id) return;
    setRevokingId(invitationId);
    try {
      const client = authClient.organization as {
        cancelInvitation?: (input: {
          invitationId: string;
        }) => Promise<unknown>;
      };
      if (!client.cancelInvitation) {
        toast.error("Revoke is not available for this workspace.");
        return;
      }
      await toast.promise(client.cancelInvitation({ invitationId }), {
        loading: "Revoking invitation…",
        success: "Invitation revoked",
        error: "Could not revoke invitation",
      });
      await loadInvitations(organization.id);
    } finally {
      setRevokingId(null);
    }
  };

  const sorted = [...invitations].sort((a, b) => {
    if (a.status === b.status) return 0;
    if (isPendingInvitationStatus(a.status)) return -1;
    if (isPendingInvitationStatus(b.status)) return 1;
    return 0;
  });

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Invitations"
      description="Pending and recent email invitations for this workspace."
      action={
        <Can action="member.invite">
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={() => setInviteOpen(true)}
          >
            <AppIcon name="invite" className="text-current" />
            Invite member
          </Button>
        </Can>
      }
    >
      {orgStatus === "loading" || !organization ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : loading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : sorted.length === 0 ? (
        <Empty className="border border-dashed py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AppIcon name="mail" className="size-5" />
            </EmptyMedia>
            <EmptyTitle>{invitationsEmpty().empty.title}</EmptyTitle>
            <EmptyDescription>
              {invitationsEmpty().empty.description}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              type="button"
              size="sm"
              className="gap-2"
              onClick={() => setInviteOpen(true)}
            >
              <AppIcon name="invite" className="text-current" />
              Invite member
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="min-w-0 overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Email</TableHead>
                <TableHead className="px-4">Role</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Expires</TableHead>
                <TableHead className="px-4 text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell className="px-4 font-medium">
                    {invite.email}
                  </TableCell>
                  <TableCell className="px-4">
                    <RoleBadge role={invite.role} />
                  </TableCell>
                  <TableCell className="px-4 capitalize">
                    {invite.status}
                  </TableCell>
                  <TableCell className="px-4 text-muted-foreground text-xs">
                    {formatDateTime(String(invite.expiresAt))}
                  </TableCell>
                  <TableCell className="px-4 text-end">
                    {isPendingInvitationStatus(invite.status) ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={revokingId === invite.id}
                        onClick={() => void revokeInvitation(invite.id)}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {organization ? (
        <InviteMemberSheet
          organizationId={organization.id}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          onInvited={() => void loadInvitations(organization.id)}
        />
      ) : null}
    </OrganizationSectionPage>
  );
}
