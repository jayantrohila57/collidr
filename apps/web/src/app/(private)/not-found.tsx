import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivateNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-semibold text-5xl text-muted-foreground">404</p>
      <h1 className="mt-4 font-semibold text-xl">Not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground text-sm">
        This project or page could not be found.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={"/dashboard/projects" as Route}>All projects</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={"/dashboard" as Route}>Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
