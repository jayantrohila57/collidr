"use client";

import { useCallback, useState } from "react";
import { auditLogEmpty } from "@/components/data-table/data-table-empty-presets";
import { ErrorState } from "@/components/patterns/error-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <Select
      value={selectedProjectId}
      items={[
        { value: "ALL", label: "All Projects" },
        ...projects.map((project) => ({
          value: project.id,
          label: project.name,
        })),
      ]}
      onValueChange={(value) => {
        if (value) setSelectedProjectId(value);
      }}
    >
      <SelectTrigger className="w-full sm:w-48" aria-label="Filter by project">
        <SelectValue placeholder="Filter by Project" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Projects</SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
