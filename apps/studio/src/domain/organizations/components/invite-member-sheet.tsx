"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FormField } from "@/components/patterns/form-field";
import {
  FormSheet,
  FormSheetBody,
  FormSheetFooter,
  FormSheetForm,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";
import { SubmitButton } from "@/components/patterns/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetClose, SheetDescription } from "@/components/ui/sheet";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { useNotificationMutations } from "@/domain/notifications/hooks/use-notifications";
import { authClient } from "@/lib/auth-client";
import { isInviteMemberFormDirty } from "@/lib/form-dirty";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

const ROLES = ["member", "manager", "owner"] as const;

type OrgInviteRole = (typeof ROLES)[number];

type InviteMemberSheetProps = {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited?: () => void;
};

export function InviteMemberSheet({
  organizationId,
  open,
  onOpenChange,
  onInvited,
}: InviteMemberSheetProps) {
  const { data: session } = useSession();
  const { syncInvitationReceived } = useNotificationMutations();
  const currentUserId = session?.user?.id;
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");
  const [inviteTeamId, setInviteTeamId] = useState<string>("");
  const [invitePending, setInvitePending] = useState(false);

  const teamsQuery = useQuery({
    ...trpc.teams.list.queryOptions(),
    enabled: open && Boolean(organizationId),
  });
  const teams = teamsQuery.data?.items ?? [];

  const resetInviteForm = () => {
    setInviteEmail("");
    setInviteRole("member");
    setInviteTeamId("");
  };

  useEffect(() => {
    if (!open) resetInviteForm();
  }, [open]);

  const inviteDirty = isInviteMemberFormDirty(inviteEmail, inviteRole);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setInvitePending(true);
    try {
      await toast.promise(
        authClient.organization.inviteMember({
          email,
          role: inviteRole as OrgInviteRole,
          organizationId,
          ...(inviteTeamId ? { teamId: inviteTeamId } : {}),
        }),
        {
          loading: "Sending invitation…",
          success: "Invitation sent",
          error: "Could not send invitation",
        },
      );
      resetInviteForm();
      closeWithoutPromptRef.current?.();
      onOpenChange(false);
      onInvited?.();
      if (isNotificationsEnabledOnClient() && currentUserId) {
        void syncInvitationReceived.mutate({
          organizationId,
          email,
        });
      }
    } catch {
      // Toast handled
    } finally {
      setInvitePending(false);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      isDirty={inviteDirty}
      onDiscard={resetInviteForm}
      closeWithoutPromptRef={closeWithoutPromptRef}
    >
      <FormSheetPopup>
        <FormSheetHeader>
          <SheetTitleWithIcon icon="invite">Invite member</SheetTitleWithIcon>
          <SheetDescription>
            Send an email invitation with a role for this organization.
          </SheetDescription>
        </FormSheetHeader>
        <FormSheetForm onSubmit={handleInvite}>
          <FormSheetBody>
            <FormField id="invite-email-sheet" label="Email" required>
              <Input
                id="invite-email-sheet"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                autoComplete="email"
              />
            </FormField>
            <FormField id="invite-role-sheet" label="Role">
              <Select
                value={inviteRole}
                items={ROLES.map((role) => ({ value: role, label: role }))}
                onValueChange={(value) => {
                  if (value) setInviteRole(value);
                }}
              >
                <SelectTrigger id="invite-role-sheet" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            {teams.length > 0 ? (
              <FormField id="invite-team-sheet" label="Team (optional)">
                <Select
                  value={inviteTeamId}
                  items={[
                    { value: "", label: "No team" },
                    ...teams.map((team) => ({
                      value: team.id,
                      label: team.name,
                    })),
                  ]}
                  onValueChange={(value) => setInviteTeamId(value ?? "")}
                >
                  <SelectTrigger id="invite-team-sheet" className="w-full">
                    <SelectValue placeholder="No team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No team</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            ) : null}
          </FormSheetBody>
          <FormSheetFooter>
            <SheetClose
              render={
                <Button
                  variant="ghost"
                  type="button"
                  disabled={invitePending}
                />
              }
            >
              Cancel
            </SheetClose>
            <SubmitButton
              isLoading={invitePending}
              loadingLabel="Sending…"
              disabled={!inviteEmail.trim()}
            >
              Send invitation
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </FormSheet>
  );
}
