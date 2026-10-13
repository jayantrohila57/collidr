"use client";

import { useCallback, useState } from "react";
import { auditLogEmpty } from "@/components/data-table/data-table-empty-presets";
import { DataTableFilterSelect } from "@/components/data-table/data-table-filter-select";
import { ErrorState } from "@/components/patterns/error-state";
import { useAudit } from "../hooks/use-audit";
import { AuditLogTableView } from "./audit-log-table-view";

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");

  const { logs, projects, status, error, revealedIds, toggleReveal, refetch } =
    useAudit({
      search: searchTerm,
      projectId: selectedProjectId === "ALL" ? undefined : selectedProjectId,
    });

  const filterActive =
    Boolean(searchTerm.trim()) || selectedProjectId !== "ALL";

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedProjectId("ALL");
  }, []);

  const projectFilter = (
    <DataTableFilterSelect
      value={selectedProjectId}
      onValueChange={setSelectedProjectId}
      triggerIcon="project"
      placeholder="All projects"
      ariaLabel="Filter by project"
      className="w-full sm:w-48"
      disabled={status === "loading" && projects.length === 0}
      options={[
        { value: "ALL", label: "All projects", icon: "projectFolder" },
        ...projects.map((project) => ({
          value: project.id,
          label: project.name,
          icon: "project" as const,
        })),
      ]}
    />
  );

  if (status === "error") {
    return (
      <ErrorState
        title="Failed to load activity"
        description={
          error?.message ?? "We could not load the audit log. Please try again."
        }
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <AuditLogTableView
      logs={logs}
      isLoading={status === "loading"}
      revealedIds={revealedIds}
      onToggleReveal={toggleReveal}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filter={projectFilter}
      filterActive={filterActive}
      empty={auditLogEmpty(clearFilters)}
    />
  );
}
