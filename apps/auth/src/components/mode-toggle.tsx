"use client";

import { Button } from "@loftlancer/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@loftlancer/ui/menu";
import { headerIconButtonClassName } from "@loftlancer/ui/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ModeToggleProps = {
  /** Matches dashboard chrome (`size-8` icon buttons). */
  compact?: boolean;
};

export function ModeToggle({ compact = false }: ModeToggleProps) {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonClass = compact ? headerIconButtonClassName : "size-11";
  const iconClass = "size-4";

  // Only render after component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className={buttonClass}>
        <Sun className={iconClass} />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button variant="outline" size="icon" className={buttonClass} />
        }
      >
        <Sun
          className={`${iconClass} rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0`}
        />
        <Moon
          className={`absolute ${iconClass} rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100`}
        />
        <span className="sr-only">Toggle theme</span>
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuItem onClick={() => setTheme("light")}>Light</MenuItem>
        <MenuItem onClick={() => setTheme("dark")}>Dark</MenuItem>
        <MenuItem onClick={() => setTheme("system")}>System</MenuItem>
      </MenuPopup>
    </Menu>
  );
}
