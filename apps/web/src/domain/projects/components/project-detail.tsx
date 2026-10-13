"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { PageStack } from "@/components/layout/app-layout";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import { CreateEnvironmentSheet } from "../../environments/components/create-environment-sheet";
import { EnvironmentPanel } from "../../environments/components/environment-panel";
import { EnvironmentsTabsView } from "../../environments/components/environments-tabs-view";
import { useEnvironments } from "../../environments/hooks/use-environments";
import { ProjectMetadataRow } from "./project-metadata-row";

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
      <ProjectMetadataRow project={project} />

      <section className={cn("flex min-w-0 flex-col", layoutGapClass)}>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 shrink-0">
            <h2 className="whitespace-nowrap font-medium text-sm">
              Environments
            </h2>
            <p className="text-muted-foreground text-xs">
              Variables and secrets per deployment target.
            </p>
          </div>
          {environments.length > 0 ? (
            <div className="flex shrink-0 items-center justify-end gap-2 sm:pt-0.5">
              <CreateEnvironmentSheet
                onConfirm={async (name) => {
                  if (!projectId) return;
                  await createEnvironment({ projectId, name });
                }}
                isPending={isCreating}
                triggerText="Add environment"
                compactOnMobile={false}
              />
            </div>
          ) : null}
        </div>

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
      </section>
    </PageStack>
  );
}
