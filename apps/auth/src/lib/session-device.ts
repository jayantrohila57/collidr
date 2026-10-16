/** Lightweight user-agent parsing for session lists (no external dependency). */
export type SessionDeviceKind = "desktop" | "mobile" | "tablet" | "unknown";

export type SessionDevice = {
  kind: SessionDeviceKind;
  os: string | null;
  browser: string | null;
};

function detectBrowser(ua: string): string | null {
  if (/Edg(e|A|iOS)?\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Firefox|FxiOS/i.test(ua)) return "Firefox";
  if (/Chrome|CriOS|Chromium/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua)) return "Safari";
  if (/curl|node|undici|axios/i.test(ua)) return "CLI";
  return null;
}

function detectOs(ua: string): string | null {
  if (/iPad/i.test(ua)) return "iPadOS";
  if (/iPhone|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/CrOS/i.test(ua)) return "ChromeOS";
  if (/Macintosh|Mac OS X/i.test(ua)) return "macOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Linux/i.test(ua)) return "Linux";
  return null;
}

export function parseSessionDevice(
  userAgent: string | null | undefined,
): SessionDevice {
  const ua = userAgent?.trim() ?? "";
  if (!ua) return { kind: "unknown", os: null, browser: null };
  const os = detectOs(ua);
  const browser = detectBrowser(ua);
  let kind: SessionDeviceKind = "desktop";
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    kind = "tablet";
  } else if (/Mobi|iPhone|iPod|Android/i.test(ua)) {
    kind = "mobile";
  } else if (!os && !browser) {
    kind = "unknown";
  }
  return { kind, os, browser };
}

export function sessionDeviceLabel(
  userAgent: string | null | undefined,
): string {
  const { os, browser } = parseSessionDevice(userAgent);
  if (browser && os) return `${browser} on ${os}`;
  return browser ?? os ?? "Unknown device";
}
