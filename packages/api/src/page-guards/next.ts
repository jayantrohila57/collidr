import "server-only";

import { notFound, redirect } from "next/navigation";
import { PageForbiddenError, PageNotFoundError } from "./errors";

export function redirectToForbidden(): never {
  redirect("/forbidden");
}

export function applyPageGuardError(error: unknown): never {
  if (error instanceof PageNotFoundError) {
    notFound();
  }
  if (error instanceof PageForbiddenError) {
    redirectToForbidden();
  }
  throw error;
}

export async function runPageGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    applyPageGuardError(error);
  }
}
