"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/utils/trpc";

export default function NewTicketPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [priority, setPriority] = useState("normal");

  const create = useMutation({
    ...trpc.support.createTicket.mutationOptions(),
    onSuccess: (ticket) => {
      router.push(`/tickets/${ticket.id}`);
    },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/tickets"
          className="text-muted-foreground text-sm underline"
        >
          ← Tickets
        </Link>
        <h1 className="mt-2 font-semibold text-2xl">New ticket</h1>
      </div>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate({
            subject,
            description,
            category: category as
              | "bug"
              | "billing"
              | "account"
              | "feature_request"
              | "other",
            priority: priority as "low" | "normal" | "high" | "urgent",
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              items={[
                { value: "bug", label: "Bug" },
                { value: "billing", label: "Billing" },
                { value: "account", label: "Account" },
                { value: "feature_request", label: "Feature request" },
                { value: "other", label: "Other" },
              ]}
              onValueChange={(v) => v && setCategory(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="feature_request">Feature request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={priority}
              items={[
                { value: "low", label: "Low" },
                { value: "normal", label: "Normal" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
              onValueChange={(v) => v && setPriority(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Submitting…" : "Create ticket"}
        </Button>
      </form>
    </div>
  );
}
