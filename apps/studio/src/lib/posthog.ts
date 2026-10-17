/**
 * PostHog in Studio (#353): the CDN loader plus tiny, PII-free helpers for
 * identify / group / reset / capture. Every helper is a no-op until PostHog
 * has been loaded (key set at build time + consent accepted), so call sites
 * never need to check either gate themselves.
 */

/** PostHog project key + host, Studio only. Unset = no banner, no script. */
export const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ?? "";
export const posthogHost = (
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com"
).replace(/\/$/, "");

/** Core product events. Properties carry counts and enums only, never names, emails, keys or values. */
export const STUDIO_EVENTS = {
  organizationCreated: "organization created",
  projectCreated: "project created",
  onboardingCompleted: "onboarding completed",
  membersInvited: "members invited",
  environmentCreated: "environment created",
  variableCreated: "variable created",
  variableUpdated: "variable updated",
  variableDeleted: "variable deleted",
  variablesImported: "variables imported",
  variablesBatchCreated: "variables batch created",
} as const;

export type StudioEvent = (typeof STUDIO_EVENTS)[keyof typeof STUDIO_EVENTS];

export type StudioEventProperties = Record<string, string | number | boolean>;

/** PostHog group type for organizations. */
export const ORGANIZATION_GROUP = "organization";

type PostHogStub = unknown[] & { _i?: unknown[]; people?: unknown[] };
type PostHogLike = PostHogStub | Record<string, unknown>;
type PostHogHost = { posthog?: PostHogLike };

function defaultHost(): PostHogHost | undefined {
  return typeof window === "undefined"
    ? undefined
    : (window as unknown as PostHogHost);
}

/**
 * Calls a PostHog method. Before array.js has loaded, `window.posthog` is the
 * snippet stub (an array); calls are queued on it the way the official
 * snippet does and replayed once the library initialises. Without PostHog
 * (no key, no consent, server render) this does nothing.
 */
export function callPostHog(
  method: string,
  args: unknown[],
  host: PostHogHost | undefined = defaultHost(),
): void {
  const instance = host?.posthog;
  if (!instance) return;
  const fn = (instance as Record<string, unknown>)[method];
  if (typeof fn === "function") {
    try {
      fn.apply(instance, args);
    } catch {
      // Analytics must never break the app.
    }
    return;
  }
  if (Array.isArray(instance)) instance.push([method, ...args]);
}

/** Identify by user id only: no email, name or other person properties. */
export function identifyUser(userId: string, host?: PostHogHost): void {
  callPostHog("identify", [userId], host ?? defaultHost());
}

/** Associate events with the active organization (id only). */
export function setOrganizationGroup(orgId: string, host?: PostHogHost): void {
  callPostHog("group", [ORGANIZATION_GROUP, orgId], host ?? defaultHost());
}

/** Drop the organization group (no active organization). */
export function resetOrganizationGroup(host?: PostHogHost): void {
  callPostHog("resetGroups", [], host ?? defaultHost());
}

/** Forget the identified user and groups (sign-out / user switch). */
export function resetPostHog(host?: PostHogHost): void {
  callPostHog("reset", [], host ?? defaultHost());
}

/** Capture a core Studio event. */
export function captureEvent(
  event: StudioEvent,
  properties?: StudioEventProperties,
  host?: PostHogHost,
): void {
  callPostHog(
    "capture",
    properties ? [event, properties] : [event],
    host ?? defaultHost(),
  );
}

/**
 * Loads PostHog from its CDN the way the official snippet does (a queued
 * stub that array.js picks up), so Studio carries no extra npm dependency.
 * Session replay masks every input; secrets never leave the page.
 * Idempotent; does nothing without a key.
 */
export function loadPostHog(): void {
  if (!posthogKey || typeof window === "undefined") return;
  const w = window as unknown as { posthog?: PostHogStub };
  if (w.posthog) return;
  const stub: PostHogStub = [];
  stub.people = [];
  stub._i = [
    [
      posthogKey,
      {
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: "history_change",
        session_recording: { maskAllInputs: true },
      },
    ],
  ];
  w.posthog = stub;
  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `${posthogHost.replace(".i.posthog.com", "-assets.i.posthog.com")}/static/array.js`;
  document.head.appendChild(script);
}
