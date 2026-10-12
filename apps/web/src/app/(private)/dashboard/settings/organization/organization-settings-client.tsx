"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/patterns/error-state";
import { FormField } from "@/components/patterns/form-field";
import { SubmitButton } from "@/components/patterns/submit-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

type MemberRow = {
  id: string;
  role: string;
  user: { name: string; email: string };
};

const ROLES = ["member", "admin", "owner"] as const;

export default function OrganizationSettingsClient() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [orgName, setOrgName] = useState<string>("");
  const [orgId, setOrgId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");
  const [invitePending, setInvitePending] = useState(false);
  const [rolePendingId, setRolePendingId] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    const org = await authClient.organization.getFullOrganization();
    if (org.data) {
      setOrgName(org.data.name);
      setOrgId(org.data.id);
      const list = await authClient.organization.listMembers({});
      setMembers((list.data?.members ?? []) as MemberRow[]);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await loadMembers();
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email || !orgId) return;
    setInvitePending(true);
    try {
      await authClient.organization.inviteMember({
        email,
        role: inviteRole as "member" | "admin" | "owner",
        organizationId: orgId,
      });
      toast.success("Invitation sent");
      setInviteEmail("");
      await loadMembers();
    } catch {
      toast.error("Could not send invitation");
    } finally {
      setInvitePending(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    setRolePendingId(memberId);
    try {
      await authClient.organization.updateMemberRole({
        memberId,
        role: role as "member" | "admin" | "owner",
        organizationId: orgId,
      });
      toast.success("Role updated");
      await loadMembers();
    } catch {
      toast.error("Could not update role");
    } finally {
      setRolePendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Organization settings unavailable"
        description="Select an organization or complete onboarding first."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4">
      <div>
        <h2 className="font-semibold text-lg">Organization</h2>
        <p className="text-muted-foreground text-sm">{orgName}</p>
      </div>

      <form onSubmit={handleInvite} className="space-y-4 rounded-lg border p-4">
        <h3 className="font-medium text-sm">Invite member</h3>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <FormField id="invite-email" label="Email" required>
            <Input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              autoComplete="email"
            />
          </FormField>
          <FormField id="invite-role" label="Role">
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger id="invite-role" className="w-full sm:w-32">
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
          <SubmitButton
            isLoading={invitePending}
            loadingLabel="Sending…"
            disabled={!inviteEmail.trim()}
          >
            Invite
          </SubmitButton>
        </div>
      </form>

      <div>
        <h3 className="mb-2 font-medium text-sm">Members</h3>
        <ul className="divide-y rounded-md border">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-col gap-2 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span>
                {member.user.name}{" "}
                <span className="text-muted-foreground">
                  ({member.user.email})
                </span>
              </span>
              <Select
                value={member.role}
                onValueChange={(role) => void handleRoleChange(member.id, role)}
                disabled={rolePendingId === member.id}
              >
                <SelectTrigger
                  className="w-full capitalize sm:w-32"
                  aria-label={`Role for ${member.user.email}`}
                >
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
            </li>
          ))}
        </ul>
      </div>

      <p className="text-muted-foreground text-xs">
        Pending invitations appear after the invitee accepts. Only owners and
        admins can change roles depending on your Better Auth configuration.
      </p>
    </div>
  );
}
