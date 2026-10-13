import { ConsoleShell } from "@/components/console-shell";
import { guardConsoleOperatorPage } from "@/lib/page-guards";

export default async function ConsoleGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardConsoleOperatorPage();
  return <ConsoleShell>{children}</ConsoleShell>;
}
