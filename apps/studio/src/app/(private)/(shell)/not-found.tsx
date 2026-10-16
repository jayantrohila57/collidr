import { FolderX } from "lucide-react";
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

import { routes } from "@/utils/navigation";

export default function PrivateNotFound() {
  return (
    <PageStack>
      <PageHeader
        title="Not found"
        description="This project or page could not be found in your workspace."
        back={routes.home()}
      />
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderX className="size-5" aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Page unavailable</EmptyTitle>
          <EmptyDescription>
            Check the URL or go back to your organizations.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" render={<Link href={routes.home()} />}>
            Your organizations
          </Button>
        </EmptyContent>
      </Empty>
    </PageStack>
  );
}
