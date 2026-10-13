"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { Eye, EyeOff, Power, Wrench } from "lucide-react";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/components/patterns/settings-layout";
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
  label: string;
  icon: typeof Power;
}[] = [
  { value: "active", label: "Active", icon: Power },
  { value: "inactive", label: "Inactive", icon: EyeOff },
  { value: "maintenance", label: "Maintenance", icon: Wrench },
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
        />
        <SettingsRow
          label="Status"
          description="Operational state for this project."
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
                  className="gap-1.5"
                  disabled={isChangingStatus}
                >
                  <option.icon className="size-3.5" aria-hidden />
                  {option.label}
                </TabsTab>
              ))}
            </TabsList>
          </Tabs>
        </SettingsRow>
        <SettingsRow
          label="Visibility"
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
            className="w-fit"
            disabled={isTogglingPublic}
            onClick={() => void toggleProjectPublic()}
          >
            {project.isPublic ? (
              <>
                <EyeOff className="me-2 size-4" aria-hidden />
                Make private
              </>
            ) : (
              <>
                <Eye className="me-2 size-4" aria-hidden />
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
