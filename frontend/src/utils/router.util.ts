/** Used when redirect value is missing (legacy behavior). */
const DEFAULT_MISSING_REDIRECT = "/";
/** Used when redirect is present but unsafe (open redirect / injection). */
const DEFAULT_INVALID_REDIRECT = "/";

function looksLikeSchemeInjection(segment: string): boolean {
  // Block "javascript:", "data:", "vbscript:", etc. when URL-parsed as path
  return /^[a-zA-Z][a-zA-Z+.\-]*:/.test(segment);
}

export function safeRedirectPath(
  raw: string | undefined | null | string[],
): string {
  const pathInput = Array.isArray(raw) ? raw[0] : raw;

  if (pathInput == null) return DEFAULT_MISSING_REDIRECT;

  const trimmed = String(pathInput).trim();
  if (!trimmed) return DEFAULT_MISSING_REDIRECT;

  if (
    trimmed.startsWith("//") ||
    trimmed.includes("\0") ||
    trimmed.includes("\\") ||
    trimmed.toLowerCase().startsWith("javascript:") ||
    trimmed.toLowerCase().startsWith("data:") ||
    trimmed.toLowerCase().startsWith("vbscript:")
  ) {
    return DEFAULT_INVALID_REDIRECT;
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  if (typeof window === "undefined") {
    if (!withLeadingSlash.startsWith("/") || withLeadingSlash.startsWith("//")) {
      return DEFAULT_INVALID_REDIRECT;
    }
    if (looksLikeSchemeInjection(withLeadingSlash.slice(1))) {
      return DEFAULT_INVALID_REDIRECT;
    }
    return withLeadingSlash;
  }

  try {
    const url = new URL(trimmed, window.location.origin);
    if (url.origin !== window.location.origin) {
      return DEFAULT_INVALID_REDIRECT;
    }
    const out = url.pathname + url.search + url.hash;
    if (!out.startsWith("/")) {
      return DEFAULT_INVALID_REDIRECT;
    }
    return out || DEFAULT_MISSING_REDIRECT;
  } catch {
    return DEFAULT_INVALID_REDIRECT;
  }
}
