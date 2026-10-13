import { FolderX } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { PageStatusEmpty } from "@/components/layout/page-state";
import { Button } from "@/components/ui/button";

export default function PrivateNotFound() {
  return (
    <PageStatusEmpty
      icon={FolderX}
      title="Not found"
      description="This project or page could not be found in your workspace."
      action={
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
      }
    />
  );
}
