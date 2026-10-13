"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const faq = useQuery(
    trpc.support.listFaqPublic.queryOptions({
      search: search.trim() || undefined,
    }),
  );

  const byCategory = new Map<
    string,
    Array<{
      id: string;
      slug: string;
      title: string;
      category: string;
      sortOrder: number;
    }>
  >();
  for (const item of faq.data?.items ?? []) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">Help center</h1>
        <p className="text-muted-foreground text-sm">
          Search frequently asked questions or open a ticket if you need more
          help.
        </p>
        <Input
          placeholder="Search articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search FAQ"
        />
      </div>
      {faq.isLoading ? (
        <p className="text-muted-foreground text-sm">Loading articles…</p>
      ) : null}
      {faq.isError ? (
        <p className="text-destructive text-sm">Could not load articles.</p>
      ) : null}
      {[...byCategory.entries()].map(([category, items]) => (
        <section key={category} className="space-y-2">
          <h2 className="font-medium text-sm capitalize">{category}</h2>
          <ul className="divide-y rounded-md border">
            {items?.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/help/${item.slug}`}
                  className="block px-3 py-2 text-sm hover:bg-muted"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {faq.isSuccess && (faq.data?.items.length ?? 0) === 0 ? (
        <p className="text-muted-foreground text-sm">No articles found.</p>
      ) : null}
    </div>
  );
}
