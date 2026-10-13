import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMenu } from "@/domain/auth/components/user-menu";
import { siteConfig } from "@/lib/siteConfig";

export default function Header() {
  return (
    <div className="container mx-auto flex h-14 w-full flex-row items-center justify-between px-4 md:px-6">
      <div className="w-full flex-1">
        <Link href="/" className="flex items-center space-x-2">
          <Avatar className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50">
            <AvatarImage src="/favicon/favicon.ico" alt={siteConfig.name} />
            <AvatarFallback className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50">
              {siteConfig.name
                ? siteConfig.name.slice(0, 2).toUpperCase()
                : "NA"}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-xl">{siteConfig.name}</span>
        </Link>
      </div>
      <div className="flex items-center space-x-2">
        <ModeToggle />
        <UserMenu />
      </div>
    </div>
  );
}
