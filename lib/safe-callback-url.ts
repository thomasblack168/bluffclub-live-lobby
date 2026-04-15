const DEFAULT_CALLBACK_PATH = "/admin";

function hasAsciiControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) < 0x20) return true;
  }
  return false;
}

/**
 * Returns a same-origin relative path safe to use after sign-in (no open redirects).
 * Allows only paths starting with "/" that are not protocol-relative ("//…").
 */
export function getSafeCallbackPath(raw: string | null | undefined, fallback = DEFAULT_CALLBACK_PATH): string {
  if (raw == null) return fallback;
  const s = raw.trim();
  if (s === "" || s.includes("\\") || hasAsciiControlChars(s)) return fallback;
  if (!s.startsWith("/")) return fallback;
  if (s.startsWith("//")) return fallback;
  return s;
}

/**
 * `signIn` may return an absolute same-origin URL or a path. Anything else falls back.
 */
export function getSafePostSignInLocation(
  raw: string | null | undefined,
  pageOrigin: string,
  fallback = DEFAULT_CALLBACK_PATH,
): string {
  if (raw == null || raw.trim() === "") return getSafeCallbackPath(fallback, fallback);
  try {
    const u = new URL(raw, pageOrigin);
    if (u.origin === pageOrigin) {
      return getSafeCallbackPath(`${u.pathname}${u.search}${u.hash}`, fallback);
    }
  } catch {
    // ignore invalid URL
  }
  return getSafeCallbackPath(raw, fallback);
}
