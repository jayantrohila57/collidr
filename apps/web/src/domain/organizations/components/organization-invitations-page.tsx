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
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { InviteMemberSheet } from "./invite-member-sheet";
import { OrganizationSectionPage } from "./organization-section-page";

type InvitationRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date | string;
};

export function OrganizationInvitationsPage({ slug }: { slug: string }) {
  const { organization, status: orgStatus } = useOrganizationBySlug(slug);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  const loadInvitations = useCallback(async (organizationId: string) => {
    setLoading(true);
    try {
      const result = await authClient.organization.listInvitations({
        query: { organizationId },
      });
      setInvitations((result.data ?? []) as InvitationRow[]);
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

  const pending = invitations.filter((i) => i.status === "pending");

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
      ) : pending.length === 0 ? (
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell className="font-medium">{invite.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={invite.role} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDateTime(String(invite.expiresAt))}
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
