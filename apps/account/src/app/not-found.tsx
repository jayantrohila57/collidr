import { FileQuestion } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { PageStatusEmpty } from "@/components/layout/page-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageStatusEmpty
      icon={FileQuestion}
      title="Page not found"
      description="This page does not exist or you no longer have access."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" render={<Link href={"/" as Route} />}>
            Go home
          </Button>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/settings" />}
          >
            Open dashboard
          </Button>
        </div>
      }
    />
  );
}
