"use client";

import { useSyncExternalStore } from "react";

/**
 * Set by the shell not-found page so the header breadcrumb (rendered by the
 * layout, outside the 404 boundary) stops echoing unknown slugs (#317).
 */
type NotFoundState = { pathname: string; depth: number } | null;

let state: NotFoundState = null;
const listeners = new Set<() => void>();

export function setRouteNotFound(next: NotFoundState) {
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Depth of real entities to keep when `pathname` is a 404, else null. */
export function useRouteNotFoundDepth(pathname: string): number | null {
  return useSyncExternalStore(
    subscribe,
    () => (state && state.pathname === pathname ? state.depth : null),
    () => null,
  );
}
