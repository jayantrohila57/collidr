import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { pageHeaderMetadataClassName } from "./page-header-metadata-styles";

export function PageHeaderMetadataSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <dl
      data-slot="page-header-metadata"
      className={cn(pageHeaderMetadataClassName, "min-h-[2.75rem] md:min-h-0")}
      aria-hidden
    >
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index === 0 ? "metadata-skeleton-a" : "metadata-skeleton-b"}
          className="col-span-2 grid grid-cols-subgrid items-center md:flex md:justify-between md:gap-3"
        >
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-20 justify-self-end md:w-24" />
        </div>
      ))}
    </dl>
  );
}
