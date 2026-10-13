import Link from "next/link";
import { PageStack } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function PrivateNotFound() {
  return (
    <PageStack>
      <PageHeader
        title="Not found"
        description="This settings page could not be found."
        back="/settings"
      />
      <Button size="sm" render={<Link href="/settings" />}>
        Account settings
      </Button>
    </PageStack>
  );
}
