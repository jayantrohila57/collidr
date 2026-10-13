import { env } from "@env-manager/env/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotificationsPageClient } from "@/domain/notifications/components/notifications-page-client";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your workspace notifications.",
};

export default async function NotificationsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/");
  }

  if (env.NOTIFICATIONS_ENABLED !== "true") {
    redirect("/dashboard");
  }

  return <NotificationsPageClient />;
}
