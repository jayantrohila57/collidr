import { type ActionToastMessages, actionToast } from "@/lib/action-toast";

export type MutationToastMessages = ActionToastMessages;

/** @deprecated Prefer `actionToast` from `@/lib/action-toast`. */
export async function runMutationToast<T>(
  promise: Promise<T>,
  messages: MutationToastMessages,
): Promise<T> {
  return actionToast(promise, messages);
}
