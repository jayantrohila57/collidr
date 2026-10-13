import { toastManager } from "@/components/ui/toast";
import { isBenignClientError } from "@/lib/errors/client-errors";

type ToastType = "error" | "info" | "loading" | "success" | "warning";

export type ToastOptions = {
  id?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

function addToast(
  title: string,
  type?: ToastType,
  options?: ToastOptions,
): string {
  const payload = {
    title,
    description: options?.description,
    type,
    actionProps: options?.action
      ? {
          children: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  };

  if (options?.id) {
    toastManager.update(options.id, payload);
    return options.id;
  }

  return toastManager.add(payload);
}

function toastFn(title: string, options?: ToastOptions): string {
  return addToast(title, undefined, options);
}

toastFn.success = (title: string, options?: ToastOptions) =>
  addToast(title, "success", options);

toastFn.error = (title: string, options?: ToastOptions) =>
  addToast(title, "error", options);

toastFn.loading = (title: string, options?: ToastOptions) =>
  addToast(title, "loading", options);

toastFn.promise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((value: T) => string);
    error?: string;
  },
): Promise<T> => {
  const id = toast.loading(messages.loading);
  return promise
    .then((result) => {
      const successTitle =
        typeof messages.success === "function"
          ? messages.success(result)
          : messages.success;
      toast.success(successTitle, { id });
      return result;
    })
    .catch((error: unknown) => {
      if (isBenignClientError(error)) {
        toastManager.update(id, { title: "", open: false });
        throw error;
      }
      const description =
        error instanceof Error
          ? error.message
          : (messages.error ?? "Request failed");
      toast.error(messages.error ?? "Something went wrong", {
        id,
        description,
      });
      throw error;
    });
};

export const toast = toastFn as typeof toastFn & {
  success: (title: string, options?: ToastOptions) => string;
  error: (title: string, options?: ToastOptions) => string;
  loading: (title: string, options?: ToastOptions) => string;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((value: T) => string);
      error?: string;
    },
  ) => Promise<T>;
};
