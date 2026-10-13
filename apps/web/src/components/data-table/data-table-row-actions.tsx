"use client";

import { MoreVertical } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";

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
      <MenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
          />
        }
      >
        <MoreVertical className="size-4" aria-hidden />
      </MenuTrigger>
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
