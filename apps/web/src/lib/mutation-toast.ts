import { toast } from "@/lib/toast";

export type MutationToastMessages = {
  loading: string;
  success: string;
  error?: string;
};

export async function runMutationToast<T>(
  promise: Promise<T>,
  messages: MutationToastMessages,
): Promise<T> {
  const id = toast.loading(messages.loading);
  try {
    const result = await promise;
    toast.success(messages.success, { id });
    return result;
  } catch (error) {
    const description =
      error instanceof Error
        ? error.message
        : (messages.error ?? "Request failed");
    toast.error(messages.error ?? "Something went wrong", {
      id,
      description,
    });
    throw error;
  }
}
