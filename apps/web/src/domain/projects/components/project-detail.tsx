"use client";

import type { ProjectOutput } from "@env-manager/api/types";
import { PageStack } from "@/components/layout/app-layout";
import { CreateEnvironmentSheet } from "../../environments/components/create-environment-sheet";
import { EnvironmentPanel } from "../../environments/components/environment-panel";
import { EnvironmentsTabsView } from "../../environments/components/environments-tabs-view";
import { useEnvironments } from "../../environments/hooks/use-environments";

interface ProjectDetailProps {
  projectSlug: string;
  project: ProjectOutput;
}

export default function ProjectDetail({
  projectSlug,
  project: _project,
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
    <PageStack className="w-full min-w-0 gap-4">
      <section className="flex min-w-0 flex-col gap-2">
        {environments.length > 0 ? (
          <div className="flex min-w-0 justify-end">
            <CreateEnvironmentSheet
              onConfirm={async (name) => {
                if (!projectId) return;
                await createEnvironment({ projectId, name });
              }}
              isPending={isCreating}
              triggerText="Add environment"
              compactOnMobile
            />
          </div>
        ) : null}

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
