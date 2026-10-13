"use client";

import { ClientRelativeTime } from "@/components/patterns/client-relative-time";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type VariableActor = {
  id: string;
  name: string;
  image?: string | null;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface VariableActorLabelProps {
  actor: VariableActor | null | undefined;
  at?: string | Date;
  className?: string;
  compact?: boolean;
}

export function VariableActorLabel({
  actor,
  at,
  className,
  compact = false,
}: VariableActorLabelProps) {
  if (!actor) {
    return (
      <span className={cn("text-muted-foreground text-xs", className)}>
        Unknown
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs",
        className,
      )}
    >
      <Avatar className={cn("shrink-0", compact ? "size-5" : "size-6")}>
        {actor.image ? <AvatarImage src={actor.image} alt="" /> : null}
        <AvatarFallback className="bg-muted font-medium text-[9px]">
          {initials(actor.name)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 truncate">
        <span className="text-foreground">{actor.name}</span>
        {at ? (
          <>
            {" · "}
            <ClientRelativeTime value={at} />
          </>
        ) : null}
      </span>
    </span>
  );
}
