import type { Route } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GoBackButton from "./go-back";
import { Button } from "./ui/button";

interface SectionProps {
  title?: string;
  description?: string;
  action?: string;
  actionUrl?: string;
  children: React.ReactNode;
}

export default function DashboardSection({
  title,
  description,
  action,
  actionUrl,
  children,
}: SectionProps) {
  return (
    <Card className="relative z-10 flex h-full min-h-0 w-full flex-col gap-2 rounded-none border-none bg-transparent p-2 group-has-data-[collapsible=icon]/sidebar-wrapper:gap-2 group-has-data-[collapsible=icon]/sidebar-wrapper:px-0">
      {title && description && (
        <CardHeader className="shrink-0 p-0">
          <div className="flex flex-row items-center gap-2">
            <GoBackButton />
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-xl">{title}</CardTitle>
              <CardDescription className="line-clamp-2 break-words text-xs">
                {description}
              </CardDescription>
            </div>
            {action && actionUrl && (
              <Button variant="default" asChild className="shrink-0">
                <Link href={actionUrl as Route}>{action}</Link>
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-md border bg-background">
        <CardContent className="p-2">{children}</CardContent>
      </div>
    </Card>
  );
}
