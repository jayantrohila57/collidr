import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { appIcons } from "@/lib/icons";
import { DataTableEmpty } from "./data-table-empty";
import type { DataTableEmptyConfig } from "./data-table-empty-types";

export function resolveDataTableEmptyMarkup({
  config,
  variant,
  onClearSearch,
  compact = true,
  fallbackTitle = "No results.",
}: {
  config?: DataTableEmptyConfig;
  variant: "empty" | "noResults";
  onClearSearch?: () => void;
  compact?: boolean;
  fallbackTitle?: string;
}): ReactNode {
  if (!config) {
    if (variant === "noResults" && onClearSearch) {
      return (
        <DataTableEmpty
          compact={compact}
          icon={appIcons.searchEmpty}
          title="No results"
          description="Try adjusting your search."
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onClearSearch}
            >
              Clear search
            </Button>
          }
        />
      );
    }
    return <DataTableEmpty compact={compact} title={fallbackTitle} />;
  }

  const slice =
    variant === "noResults" ? (config.noResults ?? config.empty) : config.empty;

  let action = slice.action;
  if (variant === "noResults" && onClearSearch && !action) {
    action = (
      <Button type="button" size="sm" variant="outline" onClick={onClearSearch}>
        Clear search
      </Button>
    );
  }

  return (
    <DataTableEmpty
      compact={compact}
      icon={slice.icon}
      title={slice.title}
      description={slice.description}
      action={action}
    />
  );
}
