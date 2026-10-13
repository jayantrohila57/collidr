"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/utils/trpc";

export default function ManageFaqPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const access = useQuery(trpc.support.accessStatus.queryOptions());
  const faq = useQuery(trpc.support.listFaqManager.queryOptions());

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [body, setBody] = useState("");

  const upsert = useMutation({
    ...trpc.support.upsertFaqArticle.mutationOptions(),
    onSuccess: async () => {
      setSlug("");
      setTitle("");
      setBody("");
      await queryClient.invalidateQueries();
    },
  });

  useEffect(() => {
    if (access.isSuccess && !access.data?.isSupportManager) {
      router.replace("/tickets");
    }
  }, [access.data, access.isSuccess, router]);

  if (!access.data?.isSupportManager) {
    return (
      <p className="text-muted-foreground text-sm">Checking manager access…</p>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-semibold text-2xl">FAQ articles</h1>
      <form
        className="space-y-3 rounded-md border p-4"
        onSubmit={(e) => {
          e.preventDefault();
          upsert.mutate({ slug, title, category, body });
        }}
      >
        <h2 className="font-medium text-sm">New article</h2>
        <Input
          placeholder="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <Textarea
          rows={6}
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <Button type="submit" disabled={upsert.isPending}>
          Publish
        </Button>
      </form>
      <ul className="divide-y rounded-md border">
        {faq.data?.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between px-3 py-2 text-sm"
          >
            <span>
              <span className="font-medium">{item.title}</span>
              <span className="text-muted-foreground"> · {item.category}</span>
            </span>
            <a className="underline" href={`/help/${item.slug}`}>
              View
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
