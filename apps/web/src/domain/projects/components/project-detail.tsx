"use client";

import { Folder, Github, Globe } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { StatusBadge } from "@/components/patterns/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EnvironmentPanel } from "../../environments/components/environment-panel";
import { EnvironmentsTabsView } from "../../environments/components/environments-tabs-view";
import { ProjectDetailSkeleton } from "../../environments/components/skeletons";
import { useEnvironments } from "../../environments/hooks/use-environments";
import { ProjectActions } from "./project-actions";

export default function ProjectDetail({
  projectSlug,
}: {
  projectSlug: string;
}) {
  const [_refreshKey, setRefreshKey] = useState(0);

  const {
    project,
    environments,
    status,
    activeTab,
    setActiveTab,
    createEnvironment,
    updateEnvironment,
    isCreating,
    isUpdating,
    projectId,
  } = useEnvironments(projectSlug);

  const handleProjectUpdate = () => {
    // Force refresh of project data
    setRefreshKey((prev) => prev + 1);
  };

  if (status === "loading") return <ProjectDetailSkeleton />;
  if (status === "error" || !project) {
    return (
      <ErrorState
        title="Project unavailable"
        description="This project could not be loaded. It may have been deleted."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Folder className="h-6 w-6" />
            Project Information
          </CardTitle>
          <CardAction>
            <ProjectActions project={project} onUpdate={handleProjectUpdate} />
          </CardAction>
        </CardHeader>
        <CardHeader>
          <CardTitle>
            {project.name}
            {project.isPublic && <Badge variant="outline">Public</Badge>}
            {project.isArchived && <Badge variant="secondary">Archived</Badge>}
          </CardTitle>
          <CardDescription className="max-w-xl break-words text-muted-foreground">
            {project.description}
          </CardDescription>
          <CardAction>
            <StatusBadge status={project.status} />
          </CardAction>
        </CardHeader>
        <CardFooter>
          {project.repositoryUrl && (
            <Link
              href={project.repositoryUrl as Route}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="View repository on GitHub"
            >
              <Button variant={"link"} size="default">
                <Github className="h-4 w-4" aria-hidden />
                <span className="ml-2 line-clamp-1">Github</span>
              </Button>
            </Link>
          )}
          {project.websiteUrl && (
            <Link
              href={project.websiteUrl as Route}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="View project website"
            >
              <Button variant={"link"} size="default">
                <Globe className="h-4 w-4" aria-hidden />
                <span className="ml-2 line-clamp-1">Website</span>
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
      <Separator />
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
        isCreating={isCreating}
        isUpdating={isUpdating}
      >
        {(env) => <EnvironmentPanel environmentId={env.id} />}
      </EnvironmentsTabsView>
    </div>
  );
}
