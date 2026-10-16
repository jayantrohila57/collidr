"use client";

import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { AppIcon } from "@/components/patterns/app-icon";
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
  return (
    <SearchableCombobox
      value={value}
      onChange={onValueChange}
      disabled={disabled}
      ariaLabel={ariaLabel}
      placeholder={placeholder}
      className={cn("w-auto min-w-[8.5rem] max-w-full", className)}
      triggerIcon={
        <AppIcon
          name={triggerIcon}
          className={cn(iconMutedClassName, "size-4 shrink-0")}
        />
      }
      options={options.map((option) => ({
        value: option.value,
        label: optionDisplayLabel(option),
        icon: option.icon ? (
          <AppIcon
            name={option.icon}
            className={cn(iconMutedClassName, "size-4 shrink-0")}
          />
        ) : undefined,
      }))}
    />
  );
}
