"use client";

import type { User } from "better-auth";
import { useEffect, useState, useTransition } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
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
import { toast } from "@/lib/toast";
import { signOut, useSession } from "../lib/auth-actions";

export function UserMenu() {
  const [isLoading, startTransition] = useTransition();
  const { data: session, isPending } = useSession();
  const user = session?.user as User | undefined;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    startTransition(async () => {
      const toastId = toast.loading("Signing out...");
      try {
        await signOut(
          () => {
            toast.success("Signed out successfully", { id: toastId });
          },
          () => {
            toast.error("Sign out failed", { id: toastId });
          },
        );
      } catch {
        toast.error("Sign out failed", { id: toastId });
      }
    });
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
              {user.email && (
                <p className="text-muted-foreground text-xs leading-none">
                  {user.email}
                </p>
              )}
            </div>
          </MenuGroupLabel>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem onClick={handleSignOut} disabled={isLoading}>
          <AppIcon name="logOut" className="me-2 size-4" />
          <span>Log out</span>
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}
