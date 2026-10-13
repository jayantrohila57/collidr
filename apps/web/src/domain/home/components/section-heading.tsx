"use client";

import { Badge } from "@/components/ui/badge";
import {
  FrameDescription,
  FrameHeader,
  FrameTitle,
} from "@/components/ui/frame";

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
    <FrameHeader>
      {badge ? <Badge variant={badgeVariant}>{badge}</Badge> : null}
      <FrameTitle>
        {title}
        {titleHighlight ? (
          <span className="block text-primary">{titleHighlight}</span>
        ) : null}
      </FrameTitle>
      <FrameDescription>{description}</FrameDescription>
    </FrameHeader>
  );
}
