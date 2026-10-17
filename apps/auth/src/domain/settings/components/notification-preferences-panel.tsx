"use client";

import { Button } from "@loftlancer/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import { routes } from "@loftlancer/ui/studio-routes";
import { studioDashboardPath } from "@/lib/studio-url";

export function NotificationPreferencesPanel() {
  const studioNotifications = studioDashboardPath(routes.notifications());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>
          In-app notifications are managed in Studio. Open your inbox to mark
          items read or review recent activity.
        </CardDescription>
      </CardHeader>
      <CardPanel>
        <Button
          type="button"
          size="sm"
          variant="outline"
          render={
            <a href={studioNotifications} rel="noopener noreferrer">
              Open Studio notifications
            </a>
          }
        >
          Open Studio notifications
        </Button>
      </CardPanel>
    </Card>
  );
}
