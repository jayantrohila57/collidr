import "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: {
      toastOnError?: boolean;
    };
    mutationMeta: {
      skipGlobalErrorToast?: boolean;
    };
  }
}
