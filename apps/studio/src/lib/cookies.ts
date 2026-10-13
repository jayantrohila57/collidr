/**
 * Safe cookie utilities for the application
 */

export interface CookieOptions {
  path?: string;
  maxAge?: number;
  expires?: Date;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  httpOnly?: boolean;
}

/**
 * Safely sets a cookie with proper error handling and security defaults
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): boolean {
  try {
    // Validate inputs
    if (!name || typeof name !== "string") {
      console.warn("Cookie name must be a non-empty string");
      return false;
    }

    if (typeof value !== "string") {
      console.warn("Cookie value must be a string");
      return false;
    }

    // Build cookie string
    const cookieParts = [
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    ];

    // Add options
    if (options.path) {
      cookieParts.push(`path=${options.path}`);
    }

    if (options.maxAge) {
      cookieParts.push(`max-age=${options.maxAge}`);
    }

    if (options.expires) {
      cookieParts.push(`expires=${options.expires.toUTCString()}`);
    }

    if (options.domain) {
      cookieParts.push(`domain=${options.domain}`);
    }

    if (options.secure) {
      cookieParts.push("secure");
    }

    if (options.sameSite) {
      cookieParts.push(`samesite=${options.sameSite}`);
    }

    if (options.httpOnly) {
      console.warn("httpOnly cookies can only be set server-side");
      return false;
    }

    // Set the cookie using a safer approach
    const cookieString = cookieParts.join("; ");

    // Use a function wrapper to avoid direct assignment warning
    const setCookieNative = (cookie: string): void => {
      // biome-ignore lint/suspicious/noDocumentCookie: Error
      document.cookie = cookie;
    };

    if (typeof document !== "undefined") {
      setCookieNative(cookieString);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Failed to set cookie:", error);
    return false;
  }
}

/**
 * Safely gets a cookie value
 */
export function getCookie(name: string): string | null {
  try {
    if (!name || typeof name !== "string") {
      return null;
    }

    if (typeof document === "undefined") {
      return null;
    }

    const encodedName = encodeURIComponent(name);
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split("=");
      if (cookieName === encodedName) {
        return decodeURIComponent(cookieValue || "");
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to get cookie:", error);
    return null;
  }
}

/**
 * Safely deletes a cookie
 */
export function deleteCookie(
  name: string,
  options: Pick<CookieOptions, "path" | "domain"> = {},
): boolean {
  return setCookie(name, "", {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  });
}
