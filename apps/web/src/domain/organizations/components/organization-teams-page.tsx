"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { EmptyState } from "@/components/patterns/empty-state";
import { FormField } from "@/components/patterns/form-field";
import { GuardedDialog } from "@/components/patterns/guarded-dialog";
import { SettingsPanelSkeleton } from "@/components/patterns/settings-panel-skeleton";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { isTeamCreateFormDirty } from "@/lib/form-dirty";
import { appIcons } from "@/lib/icons";
import { toast } from "@/lib/toast";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationSectionPage } from "./organization-section-page";

type TeamRow = { id: string; name: string };

type OrganizationTeamsClient = {
  listOrganizationTeams?: (input: {
    query: { organizationId: string };
  }) => Promise<{ data?: TeamRow[] }>;
  createTeam?: (input: {
    organizationId: string;
    name: string;
  }) => Promise<{ data?: TeamRow }>;
};

export function OrganizationTeamsPage({ slug }: { slug: string }) {
  const { organization, status: orgStatus } = useOrganizationBySlug(slug);
  const [teams, setTeams] = useState<TeamRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamsEnabled, setTeamsEnabled] = useState(true);
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [createPending, setCreatePending] = useState(false);

  const resetCreateForm = () => {
    setTeamName("");
  };

  useEffect(() => {
    if (!createOpen) resetCreateForm();
  }, [createOpen]);

  const teamsClient = authClient.organization as OrganizationTeamsClient;

  const loadTeams = useCallback(
    async (organizationId: string) => {
      setLoading(true);
      try {
        if (!teamsClient.listOrganizationTeams) {
          setTeamsEnabled(false);
          setTeams([]);
          return;
        }
        const result = await teamsClient.listOrganizationTeams({
          query: { organizationId },
        });
        setTeams(result.data ?? []);
        setTeamsEnabled(true);
      } catch {
        setTeamsEnabled(false);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    },
    [teamsClient.listOrganizationTeams],
  );

  useEffect(() => {
    if (!organization?.id) return;
    void loadTeams(organization.id);
  }, [organization?.id, loadTeams]);

  const handleCreateTeam = async () => {
    if (!organization?.id || !teamName.trim()) return;
    if (!teamsClient.createTeam) {
      toast.error("Team creation is not available for this workspace.");
      return;
    }
    setCreatePending(true);
    try {
      await toast.promise(
        teamsClient.createTeam({
          organizationId: organization.id,
          name: teamName.trim(),
        }),
        {
          loading: "Creating team…",
          success: "Team created",
          error: "Could not create team",
        },
      );
      resetCreateForm();
      closeWithoutPromptRef.current?.();
      setCreateOpen(false);
      await loadTeams(organization.id);
    } finally {
      setCreatePending(false);
    }
  };

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Teams"
      description="Group members into teams within this organization."
      action={
        teamsEnabled && organization ? (
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <AppIcon name="plus" className="text-current" />
            New team
          </Button>
        ) : undefined
      }
    >
      {orgStatus === "loading" || !organization ? (
        <SettingsPanelSkeleton rows={3} />
      ) : loading ? (
        <SettingsPanelSkeleton rows={2} />
      ) : !teamsEnabled ? (
        <EmptyState
          icon={appIcons.member}
          title="Teams not enabled yet"
          description="Organization teams will appear here once the platform enables the Better Auth teams plugin for this workspace."
        />
      ) : teams && teams.length > 0 ? (
        <ul className="divide-y rounded-xl border">
          {teams.map((team) => (
            <li
              key={team.id}
              className="flex items-center gap-2 px-4 py-3 text-sm"
            >
              <AppIcon name="member" className="text-muted-foreground" />
              {team.name}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={appIcons.member}
          title="No teams yet"
          description="Create a team to organize members and project access."
          actionLabel="New team"
          onAction={() => setCreateOpen(true)}
        />
      )}

      <GuardedDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isDirty={isTeamCreateFormDirty(teamName)}
        onDiscard={resetCreateForm}
        closeWithoutPromptRef={closeWithoutPromptRef}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create team</DialogTitle>
          </DialogHeader>
          <FormField id="team-name" label="Team name" required>
            <Input
              id="team-name"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="Platform"
            />
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={createPending || !teamName.trim()}
              onClick={() => void handleCreateTeam()}
            >
              Create team
            </Button>
          </DialogFooter>
        </DialogContent>
      </GuardedDialog>
    </OrganizationSectionPage>
  );
}
