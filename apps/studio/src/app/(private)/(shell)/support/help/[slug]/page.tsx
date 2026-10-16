"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

export default function SupportHelpArticlePage() {
  const params = useParams<{ slug: string }>();
  const article = useQuery(
    trpc.support.getFaqBySlug.queryOptions({ slug: params.slug }),
  );

  if (article.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }
  if (article.isError || !article.data) {
    return (
      <DashboardSection title="Article not found" back={routes.supportHelp()}>
        <p className="text-destructive text-sm">
          This article could not be loaded.
        </p>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection
      title={article.data.title}
      description={article.data.category}
      back={routes.supportHelp()}
    >
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {article.data.body}
      </div>
    </DashboardSection>
  );
}
