"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { AppIcon } from "@/components/patterns/app-icon";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/components/patterns/settings-layout";
import {
  StatusBadge,
  VisibilityBadge,
} from "@/components/patterns/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { toast } from "@/lib/toast";
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
  const {
    changeProjectStatus,
    toggleProjectPublic,
    isChangingStatus,
    isTogglingPublic,
  } = useProjectActions({ projectId: project.id });

  const handleStatusChange = async (
    status: "active" | "inactive" | "maintenance",
  ) => {
    if (status === project.status) return;
    try {
      await changeProjectStatus(status);
      toast.success(`Project marked as ${status}`);
    } catch {
      // global toast
    }
  };

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
                if (value) {
                  void handleStatusChange(
                    value as "active" | "inactive" | "maintenance",
                  );
                }
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit gap-2"
              disabled={isTogglingPublic}
              onClick={() => void toggleProjectPublic()}
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
            </Button>
          </div>
        </SettingsRow>
      </SettingsPanel>
      <ProjectDangerZone project={project} />
    </div>
  );
}
