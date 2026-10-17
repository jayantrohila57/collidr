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

/** Analytics consent as read by `useAnalyticsConsent` (`null` before hydration). */
export type PostHogConsent = "granted" | "denied" | "unset" | null;

/** Latest consent seen on this page; read when array.js finishes loading. */
let consentGranted = false;

type PostHogInstance = {
  has_opted_out_capturing?: () => boolean;
  opt_in_capturing?: (options?: { captureEventName?: false }) => void;
  opt_out_capturing?: () => void;
};

/** Opt in without the default `$opt_in` event: consent is already on record. */
const OPT_IN_OPTIONS = { captureEventName: false } as const;

/**
 * Brings a loaded PostHog instance in line with consent. PostHog persists an
 * opt-out across reloads, so a later re-grant has to opt back in.
 */
export function syncInstanceConsent(
  instance: PostHogInstance,
  granted: boolean,
): void {
  try {
    if (!granted) {
      instance.opt_out_capturing?.();
    } else if (instance.has_opted_out_capturing?.()) {
      instance.opt_in_capturing?.(OPT_IN_OPTIONS);
    }
  } catch {
    // Analytics must never break the app.
  }
}

/** True when the last consent call queued on the stub is an opt-out. */
function stubOptedOut(stub: unknown[]): boolean {
  for (let i = stub.length - 1; i >= 0; i--) {
    const item = stub[i];
    if (!Array.isArray(item)) continue;
    if (item[0] === "opt_out_capturing") return true;
    if (item[0] === "opt_in_capturing") return false;
  }
  return false;
}

/**
 * Applies a consent change on the current page (#353). Withdrawing (denied,
 * or the choice cleared) opts PostHog out at once, so capture and replay stop
 * without a reload. Granting loads PostHog, or opts an already-loaded,
 * opted-out instance back in.
 */
export function applyPostHogConsent(
  consent: PostHogConsent,
  host: PostHogHost | undefined = defaultHost(),
): void {
  if (consent === null) return;
  consentGranted = consent === "granted";
  const instance = host?.posthog;
  if (!instance) {
    if (consentGranted) loadPostHog();
    return;
  }
  if (Array.isArray(instance)) {
    if (!consentGranted) instance.push(["opt_out_capturing"]);
    else if (stubOptedOut(instance))
      instance.push(["opt_in_capturing", OPT_IN_OPTIONS]);
    return;
  }
  syncInstanceConsent(instance as PostHogInstance, consentGranted);
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
  // Only ever called with consent granted.
  consentGranted = true;
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
        // Undo an opt-out persisted by an earlier withdrawal once consent is back.
        loaded: (instance: PostHogInstance) =>
          syncInstanceConsent(instance, consentGranted),
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
