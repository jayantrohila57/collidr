"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEnvironments } from "../../environments/hooks/use-environments";
import { EditProject } from "./project-edit";

interface EditProjectPageProps {
  projectSlug: string;
}

export default function EditProjectPage({ projectSlug }: EditProjectPageProps) {
  const { project, status } = useEnvironments(projectSlug);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "error" || !project) {
    return (
      <div className="py-12 text-center">
        <h2 className="font-semibold text-xl">Project not found</h2>
        <Link href="/dashboard">
          <Button variant="link">Go back to dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/projects/${projectSlug}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="me-2 h-4 w-4" />
            Back to Project
          </Button>
        </Link>
      </div>

      {/* Edit Form */}
      <EditProject
        project={project}
        onSuccess={() => {
          // Redirect back to project page after successful edit
          window.location.href = `/dashboard/projects/${projectSlug}`;
        }}
      />
    </div>
  );
}
