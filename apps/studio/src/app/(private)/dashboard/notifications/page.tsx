import { env } from "@env-manager/env/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guardPageAction } from "@/lib/page-guards";
import { NotificationsPageClient } from "@/domain/notifications/components/notifications-page-client";

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
