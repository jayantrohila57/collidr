"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { trpc } from "@/utils/trpc";

export default function ConsoleSupportTicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);

  const detail = useQuery(
    trpc.support.getTicket.queryOptions({ ticketId: params.ticketId }),
  );

  const replyMutation = useMutation({
    ...trpc.support.replyToTicket.mutationOptions(),
    onSuccess: async () => {
      setReply("");
      await queryClient.invalidateQueries();
    },
  });

  const statusMutation = useMutation({
    ...trpc.support.updateTicketStatus.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const ticket = detail.data?.ticket;

  if (detail.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading ticket…</p>;
  }
  if (!ticket) {
    return <p className="text-destructive text-sm">Ticket not found.</p>;
  }

  return (
    <div className="space-y-6">
      <ConsolePageHeader
        title={`#${ticket.ticketNumber} ${ticket.subject}`}
        description="Manager view — internal notes visible."
      />
      <Link
        href={"/dashboard/support/tickets" as Route}
        className="text-muted-foreground text-sm underline"
      >
        ← Queue
      </Link>
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{ticket.status.replace("_", " ")}</Badge>
          <Badge variant="secondary">{ticket.priority}</Badge>
          <Badge variant="outline">{ticket.category}</Badge>
        </div>
        <Select
          value={ticket.status}
          items={[
            { value: "open", label: "Open" },
            { value: "pending", label: "Pending" },
            { value: "in_progress", label: "In progress" },
            { value: "resolved", label: "Resolved" },
            { value: "closed", label: "Closed" },
          ]}
          onValueChange={(status) => {
            if (!status) return;
            statusMutation.mutate({
              ticketId: ticket.id,
              status: status as
                | "open"
                | "pending"
                | "in_progress"
                | "resolved"
                | "closed",
            });
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="whitespace-pre-wrap text-sm">{ticket.description}</p>
      <section className="space-y-3">
        <h2 className="font-medium text-sm">Conversation</h2>
        <ul className="space-y-3">
          {detail.data?.messages.map((message) => (
            <li key={message.id} className="rounded-md border p-3 text-sm">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                <span>{message.authorName ?? message.authorEmail}</span>
                {message.isInternal ? (
                  <Badge variant="destructive">Internal</Badge>
                ) : null}
                <span>{new Date(message.createdAt).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-wrap">{message.body}</p>
            </li>
          ))}
        </ul>
      </section>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          replyMutation.mutate({
            ticketId: ticket.id,
            body: reply,
            isInternal: internal,
          });
        }}
      >
        <Textarea
          rows={4}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply…"
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={internal}
            onChange={(e) => setInternal(e.target.checked)}
          />
          Internal note
        </label>
        <Button type="submit" disabled={replyMutation.isPending}>
          Send reply
        </Button>
      </form>
    </div>
  );
}
