import { ModeToggle } from "@/components/mode-toggle";
import Shell from "@/components/shell";
import { UserMenu } from "@/domain/auth/components/user-menu";
import { layoutInsetXClass } from "@/lib/layout-spacing";
import { guardAuthenticatedPage } from "@/lib/page-guards";
import { cn } from "@/lib/utils";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardAuthenticatedPage();
  return (
    <Shell>
      <div className="flex h-svh max-h-svh min-h-0 flex-col overflow-hidden">
        <header
          className={cn(
            "flex shrink-0 items-center justify-between border-b py-3",
            layoutInsetXClass,
          )}
        >
          <p className="font-medium text-sm">Account settings</p>
          <div className="flex items-center gap-2">
            <ModeToggle compact />
            <UserMenu />
          </div>
        </header>
        <Shell.Main
          variant="dashboard"
          padding="none"
          scale="dashboard"
          className="min-h-0 flex-1"
        >
          {children}
        </Shell.Main>
      </div>
    </Shell>
  );
}
