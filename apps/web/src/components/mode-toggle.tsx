"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";

export function ModeToggle() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="size-11">
        <Sun className="size-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Menu>
      <MenuTrigger
        render={<Button variant="outline" size="icon" className="size-11" />}
      >
        <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
