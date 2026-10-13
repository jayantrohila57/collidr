import { ConsoleShell } from "@/components/console-shell";

export default function ConsoleGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConsoleShell>{children}</ConsoleShell>;
}
