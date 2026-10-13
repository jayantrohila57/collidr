import { toast } from "@/lib/toast";

export type ActionToastMessages = {
  loading: string;
  success: string;
  error?: string;
};

/** Wrap an async mutation with loading → success → error toasts. */
export function actionToast<T>(
  promise: Promise<T>,
  messages: ActionToastMessages,
): Promise<T> {
  return toast.promise(promise, messages);
}
