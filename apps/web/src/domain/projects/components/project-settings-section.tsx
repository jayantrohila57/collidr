"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { AppIcon } from "@/components/patterns/app-icon";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/components/patterns/settings-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import type { AppIconName } from "@/lib/icons";
import { toast } from "@/lib/toast";
import { useProjectActions } from "../hooks/use-project-actions";
import { ProjectDangerZone } from "./project-danger-zone";

interface ProjectSettingsSectionProps {
  project: ProjectOutput;
}

const STATUS_OPTIONS: {
  value: "active" | "inactive" | "maintenance";
  label: string;
  icon: AppIconName;
}[] = [
  { value: "active", label: "Active", icon: "statusActive" },
  { value: "inactive", label: "Inactive", icon: "statusInactive" },
  { value: "maintenance", label: "Maintenance", icon: "statusMaintenance" },
];

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
                  className="gap-2"
                  disabled={isChangingStatus}
                >
                  <AppIcon
                    name={option.icon}
                    className="size-3.5 text-current"
                  />
                  {option.label}
                </TabsTab>
              ))}
            </TabsList>
          </Tabs>
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
        </SettingsRow>
      </SettingsPanel>
      <ProjectDangerZone project={project} />
    </div>
  );
}
