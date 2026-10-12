"use client";

import type { User } from "better-auth";
import { LogOut } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "../lib/auth-actions";

export function UserMenu() {
  const [isLoading, startTransition] = useTransition();
  const { data: session } = useSession();
  const user = session?.user as User;
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

  if (!mounted) {
    return (
      <Avatar className="border bg-background shadow-xs">
        <AvatarFallback>
          {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/30">
          <AvatarImage src={String(user?.image)} alt={user?.name} />
          <AvatarFallback>
            {user?.name?.charAt(0) || user?.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{user?.name}</p>
            {user?.email && (
              <p className="text-muted-foreground text-xs leading-none">
                {user?.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
