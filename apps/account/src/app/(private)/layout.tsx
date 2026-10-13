import { ModeToggle } from "@/components/mode-toggle";
import Shell from "@/components/shell";
import { UserMenu } from "@/domain/auth/components/user-menu";
import { layoutInsetXClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Shell>
      <header
        className={cn(
          "flex items-center justify-between border-b py-3",
          layoutInsetXClass,
        )}
      >
        <p className="font-medium text-sm">Account settings</p>
        <div className="flex items-center gap-2">
          <ModeToggle compact />
          <UserMenu />
        </div>
      </header>
      <Shell.Main variant="dashboard" padding="none" scale="dashboard">
        <div className={cn("mx-auto w-full max-w-4xl py-6", layoutInsetXClass)}>
          {children}
        </div>
      </Shell.Main>
    </Shell>
  );
}
