"use client";

import { performPlatformSignOut } from "@loftlancer/ui/platform-sign-out";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "better-auth";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export function ConsoleUserMenu() {
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as User | undefined;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    setIsSigningOut(true);
    void performPlatformSignOut({
      onClearClient: () => queryClient.clear(),
      signOutLocal: () => authClient.signOut(),
    }).finally(() => setIsSigningOut(false));
  };

  if (!mounted || isPending) {
    return (
      <div
        className="flex size-8 items-center justify-center rounded-full border bg-muted"
        aria-hidden
      >
        <Spinner className="size-4" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 overflow-hidden rounded-full p-0"
            aria-label="Open account menu"
          />
        }
      >
        <Avatar className="size-8 bg-background">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback>
            {user.name?.charAt(0) || user.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </MenuTrigger>
      <MenuPopup className="w-56" align="end">
        <MenuGroup>
          <MenuGroupLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="font-medium text-sm leading-none">{user.name}</p>
              {user.email ? (
                <p className="text-muted-foreground text-xs leading-none">
                  {user.email}
                </p>
              ) : null}
            </div>
          </MenuGroupLabel>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem onClick={handleSignOut} disabled={isSigningOut}>
          <LogOut className="me-2 size-4" />
          <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}
