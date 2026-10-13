import { FolderX } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { PageStack } from "@/components/layout/app-layout";
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
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderX className="size-5" aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Not found</EmptyTitle>
          <EmptyDescription>
            This project or page could not be found in your workspace.
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
