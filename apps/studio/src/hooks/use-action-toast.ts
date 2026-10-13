"use client";

import { useCallback } from "react";
import { type ActionToastMessages, actionToast } from "@/lib/action-toast";

export function useActionToast() {
  const run = useCallback(
    <T>(promise: Promise<T>, messages: ActionToastMessages) =>
      actionToast(promise, messages),
    [],
  );

  return { actionToast: run };
}

export type { ActionToastMessages };
