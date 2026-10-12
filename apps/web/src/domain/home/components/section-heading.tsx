"use client";

import { Badge } from "@/components/ui/badge";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  titleHighlight?: string;
  description: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

export default function SectionHeading({
  badge,
  title,
  titleHighlight,
  description,
  badgeVariant = "outline",
}: SectionHeadingProps) {
  return (
    <div className="mb-16">
      {badge && (
        <Badge variant={badgeVariant} className="mb-4">
          {badge}
        </Badge>
      )}
      <h2 className="mb-4 font-bold text-2xl tracking-tight sm:text-4xl lg:text-5xl">
        {title}
        {titleHighlight && (
          <span className="block text-primary">{titleHighlight}</span>
        )}
      </h2>
      <p className="text-lg text-muted-foreground">{description}</p>
    </div>
  );
}
