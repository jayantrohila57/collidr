import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatValue = { value: number } | { error: string };

export function StatCard({
  label,
  stat,
  className,
}: {
  label: string;
  stat: StatValue | undefined;
  className?: string;
}) {
  const hasError = stat && "error" in stat;

  return (
    <Card className={cn(className)}>
      <CardContent className="p-4">
        <dt className="text-muted-foreground text-xs">{label}</dt>
        {hasError ? (
          <dd className="text-destructive text-sm">{stat.error}</dd>
        ) : (
          <dd className="font-semibold text-2xl tabular-nums">
            {stat && "value" in stat ? stat.value : "—"}
          </dd>
        )}
      </CardContent>
    </Card>
  );
}
