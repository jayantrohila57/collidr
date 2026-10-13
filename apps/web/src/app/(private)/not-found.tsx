import { FolderX } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { PageStack } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function PrivateNotFound() {
  return (
    <PageStack>
      <PageHeader
        title="Not found"
        description="This project or page could not be found in your workspace."
        back="/dashboard"
      />
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderX className="size-5" aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Page unavailable</EmptyTitle>
          <EmptyDescription>
            Check the URL or return to your projects list.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              size="sm"
              render={<Link href={"/dashboard/projects" as Route} />}
            >
              All projects
            </Button>
            <Button
              size="sm"
              variant="outline"
              render={<Link href={"/dashboard" as Route} />}
            >
              Dashboard
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </PageStack>
  );
}
