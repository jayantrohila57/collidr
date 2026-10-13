"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { PageStack } from "@/components/layout/app-layout";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { CreateEnvironmentSheet } from "../../environments/components/create-environment-sheet";
import { EnvironmentPanel } from "../../environments/components/environment-panel";
import { EnvironmentsTabsView } from "../../environments/components/environments-tabs-view";
import { useEnvironments } from "../../environments/hooks/use-environments";
import { ProjectOverviewCard } from "./project-overview-card";

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

  return (
    <PageStack className="w-full min-w-0">
      <ProjectOverviewCard project={project} />

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Environments</CardTitle>
          <CardDescription>
            Variables and secrets per deployment target.
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
                compactOnMobile={false}
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
    </PageStack>
  );
}
