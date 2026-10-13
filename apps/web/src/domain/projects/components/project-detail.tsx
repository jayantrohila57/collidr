"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { Github, Globe } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { TruncatedText } from "@/components/patterns/truncated-text";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EnvironmentPanel } from "../../environments/components/environment-panel";
import { EnvironmentsTabsView } from "../../environments/components/environments-tabs-view";
import { useEnvironments } from "../../environments/hooks/use-environments";

interface ProjectDetailProps {
  projectSlug: string;
  project: ProjectOutput;
}

export default function ProjectDetail({
  projectSlug,
  project,
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
    <div className="flex min-w-0 max-w-full flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>About this project</CardTitle>
        </CardHeader>
        <CardPanel>
          <TruncatedText
            text={project.description ?? ""}
            emptyFallback="No description provided."
          />
          {hasLinks && (
            <div className="flex flex-wrap items-center gap-2">
              {project.repositoryUrl && (
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
                    <Github className="h-4 w-4" aria-hidden />
                    Repository
                  </TooltipTrigger>
                  <TooltipContent>Open GitHub repository</TooltipContent>
                </Tooltip>
              )}
              {project.websiteUrl && (
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
                    <Globe className="h-4 w-4" aria-hidden />
                    Website
                  </TooltipTrigger>
                  <TooltipContent>Open project website</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </CardPanel>
      </Card>
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
    </div>
  );
}
