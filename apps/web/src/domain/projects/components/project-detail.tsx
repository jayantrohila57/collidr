"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { Edit, Github, Globe } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { TruncatedText } from "@/components/patterns/truncated-text";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreateEnvironmentSheet } from "../../environments/components/create-environment-sheet";
import { EnvironmentPanel } from "../../environments/components/environment-panel";
import { EnvironmentsTabsView } from "../../environments/components/environments-tabs-view";
import { useEnvironments } from "../../environments/hooks/use-environments";
import { ProjectDangerZone } from "./project-danger-zone";
import { ProjectDetailMetadata } from "./project-detail-metadata";
import { ProjectSettingsSection } from "./project-settings-section";

interface ProjectDetailProps {
  projectSlug: string;
  project: ProjectOutput;
  onEditProject?: () => void;
}

export default function ProjectDetail({
  projectSlug,
  project,
  onEditProject,
}: ProjectDetailProps) {
  const {
    environments,
    activeTab,
    setActiveTab,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    isCreating,
    isUpdating,
    isDeleting,
    projectId,
  } = useEnvironments(projectSlug);

  const hasLinks = Boolean(project.repositoryUrl || project.websiteUrl);

  return (
    <div className="flex w-full flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            Summary, links, and how this project is described.
          </CardDescription>
          {onEditProject ? (
            <CardAction>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEditProject}
              >
                <Edit className="me-2 size-4" aria-hidden />
                Edit
              </Button>
            </CardAction>
          ) : null}
        </CardHeader>
        <CardPanel className="flex flex-col gap-4">
          <TruncatedText
            text={project.description ?? ""}
            emptyFallback="No description provided."
          />
          {hasLinks ? (
            <div className="flex flex-wrap items-center gap-2">
              {project.repositoryUrl ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link
                            href={project.repositoryUrl as Route}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      />
                    }
                  >
                    <Github className="size-4" aria-hidden />
                    Repository
                  </TooltipTrigger>
                  <TooltipContent>Open GitHub repository</TooltipContent>
                </Tooltip>
              ) : null}
              {project.websiteUrl ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link
                            href={project.websiteUrl as Route}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      />
                    }
                  >
                    <Globe className="size-4" aria-hidden />
                    Website
                  </TooltipTrigger>
                  <TooltipContent>Open project website</TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          ) : null}
        </CardPanel>
      </Card>

      <ProjectDetailMetadata project={project} />

      <Card>
        <CardHeader>
          <CardTitle>Environments</CardTitle>
          <CardDescription>
            Switch between deployment targets and manage their variables.
          </CardDescription>
          {environments.length > 0 ? (
            <CardAction>
              <CreateEnvironmentSheet
                onConfirm={async (name) => {
                  if (!projectId) return;
                  await createEnvironment({ projectId, name });
                }}
                isPending={isCreating}
                triggerText="Add environment"
                compactOnMobile
              />
            </CardAction>
          ) : null}
        </CardHeader>
        <CardPanel className="min-w-0 pt-0">
          <EnvironmentsTabsView
            environments={environments}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onCreate={async (name) => {
              if (!projectId) return;
              await createEnvironment({ projectId, name });
            }}
            onUpdate={async (id, name) => {
              await updateEnvironment({ id, name });
            }}
            onDelete={async (id) => {
              await deleteEnvironment({ id });
            }}
            isCreating={isCreating}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          >
            {(env) => <EnvironmentPanel environmentId={env.id} />}
          </EnvironmentsTabsView>
        </CardPanel>
      </Card>

      <ProjectSettingsSection project={project} />
      <ProjectDangerZone project={project} />
    </div>
  );
}
