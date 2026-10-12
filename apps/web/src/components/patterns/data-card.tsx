import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DataCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  minHeightClass?: string;
}

export function DataCard({
  title,
  description,
  action,
  footer,
  children,
  className,
  minHeightClass = "min-h-80",
}: DataCardProps) {
  return (
    <Card className={cn("border bg-input/30", minHeightClass, className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate">{title}</CardTitle>
          {description && (
            <CardDescription className="break-words">
              {description}
            </CardDescription>
          )}
        </div>
        {action}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
