"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { Eye, EyeOff, Power, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { useProjectActions } from "../hooks/use-project-actions";

interface ProjectSettingsSectionProps {
  project: ProjectOutput;
}

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
    try {
      await changeProjectStatus(status);
      const label =
        status === "active"
          ? "active"
          : status === "inactive"
            ? "inactive"
            : "maintenance";
      toast.success(`Project marked as ${label}`);
    } catch {
      // Error toast handled globally
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Runtime status and who can discover this project.
        </CardDescription>
      </CardHeader>
      <CardPanel className="flex flex-col gap-6">
        <div className="space-y-2">
          <p className="font-medium text-sm">Status</p>
          <p className="text-muted-foreground text-sm">
            Control whether deployments and integrations should treat this
            project as live.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={project.status === "active" ? "default" : "outline"}
              size="sm"
              disabled={isChangingStatus || project.status === "active"}
              onClick={() => void handleStatusChange("active")}
            >
              <Power className="me-2 size-4" aria-hidden />
              Active
            </Button>
            <Button
              type="button"
              variant={project.status === "inactive" ? "default" : "outline"}
              size="sm"
              disabled={isChangingStatus || project.status === "inactive"}
              onClick={() => void handleStatusChange("inactive")}
            >
              <RefreshCw className="me-2 size-4" aria-hidden />
              Inactive
            </Button>
            <Button
              type="button"
              variant={project.status === "maintenance" ? "default" : "outline"}
              size="sm"
              disabled={isChangingStatus || project.status === "maintenance"}
              onClick={() => void handleStatusChange("maintenance")}
            >
              <RefreshCw className="me-2 size-4" aria-hidden />
              Maintenance
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-sm">Visibility</p>
          <p className="text-muted-foreground text-sm">
            {project.isPublic
              ? "This project is visible to anyone with the link."
              : "Only organization members can access this project."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
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
        </div>
      </CardPanel>
    </Card>
  );
}
