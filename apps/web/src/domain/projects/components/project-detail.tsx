"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { Github, Globe, Info } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { TruncatedText } from "@/components/patterns/truncated-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-w-0 max-w-full space-y-4">
      <Card className="border-0 bg-muted/20 shadow-none ring-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-medium text-base">
            <Info className="h-4 w-4 text-muted-foreground" aria-hidden />
            About this project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TruncatedText
            text={project.description ?? ""}
            emptyFallback="No description provided."
          />
          {hasLinks && (
            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              {project.repositoryUrl && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={project.repositoryUrl as Route}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-4 w-4" aria-hidden />
                        Repository
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open GitHub repository</TooltipContent>
                </Tooltip>
              )}
              {project.websiteUrl && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={project.websiteUrl as Route}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4" aria-hidden />
                        Website
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open project website</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </CardContent>
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
