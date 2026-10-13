"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "env-manager-support-cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          We use essential cookies for sign-in and preferences. See our{" "}
          <a href="/legal/cookies" className="underline underline-offset-2">
            Cookie Policy
          </a>
          .
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "accepted");
            setVisible(false);
          }}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
