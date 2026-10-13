import { env } from "@collidr/env/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotificationsPageClient } from "@/domain/notifications/components/notifications-page-client";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your workspace notifications.",
};

export default async function NotificationsPage() {
  await guardPageAction("notification.list");
  if (env.NOTIFICATIONS_ENABLED !== "true") {
    redirect("/dashboard");
  }

  return <NotificationsPageClient />;
}
