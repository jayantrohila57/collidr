"use client";

import { Fragment, type ReactNode } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type DataTableRowAction = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

export function DataTableRowActions({
  actions,
  label = "Row actions",
}: {
  actions: DataTableRowAction[];
  label?: string;
}) {
  if (actions.length === 0) return null;

  return (
    <Menu>
      <Tooltip>
        <TooltipTrigger
          render={
            <MenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={label}
                />
              }
            />
          }
        >
          <AppIcon name="rowActions" />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <MenuPopup align="end">
        {actions.map((action, index) => {
          const showSeparator =
            action.destructive && index > 0 && !actions[index - 1]?.destructive;
          return (
            <Fragment key={action.label}>
              {showSeparator ? <MenuSeparator /> : null}
              <MenuItem
                disabled={action.disabled}
                variant={action.destructive ? "destructive" : "default"}
                onClick={action.onSelect}
              >
                {action.icon}
                {action.label}
              </MenuItem>
            </Fragment>
          );
        })}
      </MenuPopup>
    </Menu>
  );
}
