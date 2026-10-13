import { toastManager } from "@/components/ui/toast";

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

export const toast = toastFn as typeof toastFn & {
  success: (title: string, options?: ToastOptions) => string;
  error: (title: string, options?: ToastOptions) => string;
  loading: (title: string, options?: ToastOptions) => string;
};
