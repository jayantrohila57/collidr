"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";

export default function HelpArticlePage() {
  const params = useParams<{ slug: string }>();
  const article = useQuery(
    trpc.support.getFaqBySlug.queryOptions({ slug: params.slug }),
  );

  if (article.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }
  if (article.isError || !article.data) {
    return (
      <p className="text-destructive text-sm">
        Article not found.{" "}
        <Link href="/help" className="underline">
          Back to help center
        </Link>
      </p>
    );
  }

  return (
    <article className="space-y-4">
      <Link href="/help" className="text-muted-foreground text-sm underline">
        ← Help center
      </Link>
      <h1 className="font-semibold text-2xl">{article.data.title}</h1>
      <p className="text-muted-foreground text-xs capitalize">
        {article.data.category}
      </p>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {article.data.body}
      </div>
    </article>
  );
}
