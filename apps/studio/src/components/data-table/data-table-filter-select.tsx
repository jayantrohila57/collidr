"use client";

import { AppIcon } from "@/components/patterns/app-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppIconName } from "@/lib/icons";
import { iconMutedClassName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { dataTableFilterOptionLabel } from "./data-table-filter-labels";

export type DataTableFilterOption = {
  value: string;
  label?: string;
  icon?: AppIconName;
  suffix?: string;
};

export type DataTableFilterSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: DataTableFilterOption[];
  triggerIcon: AppIconName;
  placeholder: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
};

function optionDisplayLabel(option: DataTableFilterOption) {
  return `${dataTableFilterOptionLabel(option.value, option.label)}${option.suffix ?? ""}`;
}

export function DataTableFilterSelect({
  value,
  onValueChange,
  options,
  triggerIcon,
  placeholder,
  ariaLabel,
  className,
  disabled,
}: DataTableFilterSelectProps) {
  const selectItems = options.map((option) => ({
    value: option.value,
    label: optionDisplayLabel(option),
  }));

  return (
    <Select
      value={value}
      items={selectItems}
      disabled={disabled}
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
    >
      <SelectTrigger
        className={cn(
          "h-8 w-auto min-w-[8.5rem] max-w-full justify-start gap-1.5 [&_[data-slot=select-icon]]:ms-0 [&_[data-slot=select-value]]:flex [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-none [&_[data-slot=select-value]]:items-center",
          className,
        )}
        aria-label={ariaLabel}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <AppIcon
            name={triggerIcon}
            className={cn(iconMutedClassName, "size-4 shrink-0")}
          />
          <SelectValue placeholder={placeholder} />
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex min-w-0 items-center gap-2">
              {option.icon ? (
                <AppIcon
                  name={option.icon}
                  className={cn(iconMutedClassName, "size-4 shrink-0")}
                />
              ) : null}
              <span className="truncate">{optionDisplayLabel(option)}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
