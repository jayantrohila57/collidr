"use client";

import type { ProjectOutput } from "@collidr/api/types";
import { useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { LoadingButton } from "@/components/patterns/loading-button";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/components/patterns/settings-layout";
import {
  StatusBadge,
  VisibilityBadge,
} from "@/components/patterns/status-badge";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { useProjectActions } from "../hooks/use-project-actions";
import { ProjectDangerZone } from "./project-danger-zone";

interface ProjectSettingsSectionProps {
  project: ProjectOutput;
}

const STATUS_OPTIONS: {
  value: "active" | "inactive" | "maintenance";
}[] = [{ value: "active" }, { value: "inactive" }, { value: "maintenance" }];

export function ProjectSettingsSection({
  project,
}: ProjectSettingsSectionProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<
    "active" | "inactive" | "maintenance" | null
  >(null);
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);

  const {
    changeProjectStatus,
    toggleProjectPublic,
    isChangingStatus,
    isTogglingPublic,
  } = useProjectActions({ projectId: project.id });

  const statusLabel = pendingStatus ?? project.status;

  return (
    <div className="flex flex-col gap-4">
      <SettingsPanel>
        <SettingsSectionHeader
          title="Project settings"
          description="Status, visibility, and runtime behavior."
          icon="settings"
        />
        <SettingsRow
          label="Status"
          description="Operational state for this project."
          icon="statusActive"
        >
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <StatusBadge status={project.status} />
            <Tabs
              value={project.status}
              onValueChange={(value) => {
                if (!value || value === project.status) return;
                setPendingStatus(
                  value as "active" | "inactive" | "maintenance",
                );
                setStatusDialogOpen(true);
              }}
            >
              <TabsList size="sm" className="h-auto w-fit justify-start">
                {STATUS_OPTIONS.map((option) => (
                  <TabsTab
                    key={option.value}
                    value={option.value}
                    disabled={isChangingStatus}
                    className="capitalize"
                  >
                    {option.value}
                  </TabsTab>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </SettingsRow>
        <SettingsRow
          label="Visibility"
          icon="globe"
          description={
            project.isPublic
              ? "Visible to anyone with the link."
              : "Only organization members can access."
          }
        >
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <VisibilityBadge isPublic={project.isPublic} />
            <LoadingButton
              type="button"
              variant="outline"
              size="sm"
              className="w-fit gap-2"
              loading={isTogglingPublic}
              loadingLabel="Updating…"
              onClick={() => setVisibilityDialogOpen(true)}
            >
              {project.isPublic ? (
                <>
                  <AppIcon name="lock" className="text-current" />
                  Make private
                </>
              ) : (
                <>
                  <AppIcon name="globe" className="text-current" />
                  Make public
                </>
              )}
            </LoadingButton>
          </div>
        </SettingsRow>
      </SettingsPanel>
      <ProjectDangerZone project={project} />

      <ConfirmDialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          setStatusDialogOpen(open);
          if (!open) setPendingStatus(null);
        }}
        title="Change project status"
        description={`Mark "${project.name}" as ${statusLabel}? This updates how the project appears across the workspace.`}
        confirmLabel={`Set ${statusLabel}`}
        onConfirm={async () => {
          if (!pendingStatus) return;
          await changeProjectStatus(pendingStatus);
        }}
        isPending={isChangingStatus}
      />

      <ConfirmDialog
        open={visibilityDialogOpen}
        onOpenChange={setVisibilityDialogOpen}
        title={
          project.isPublic ? "Make project private" : "Make project public"
        }
        description={
          project.isPublic
            ? `Make "${project.name}" private? Metadata will no longer be exposed publicly.`
            : `Make "${project.name}" public? Project metadata may be visible to others.`
        }
        confirmLabel={project.isPublic ? "Make private" : "Make public"}
        onConfirm={toggleProjectPublic}
        isPending={isTogglingPublic}
      />
    </div>
  );
}
