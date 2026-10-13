import { env } from "@collidr/env/web";

export function isNotificationsEnabledOnClient(): boolean {
  return env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED === "true";
}
