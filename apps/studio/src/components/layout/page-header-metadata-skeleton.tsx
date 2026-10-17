import { Skeleton } from "@loftlancer/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  pageHeaderMetadataClassName,
  pageHeaderMetadataFieldClassName,
} from "./page-header-metadata-styles";

export function PageHeaderMetadataSkeleton({
  rows = 2,
}: {
  rows?: number;
} = {}) {
  return (
    <dl
      data-slot="page-header-metadata"
      className={cn(pageHeaderMetadataClassName)}
      aria-hidden
    >
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index === 0 ? "metadata-skeleton-a" : "metadata-skeleton-b"}
          className={pageHeaderMetadataFieldClassName}
        >
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </dl>
  );
}
