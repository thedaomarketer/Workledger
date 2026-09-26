/**
 * Returns `value` only if it is a same-site path ("/dashboard?x=1"), else
 * `fallback`. Redirect targets arrive from query strings and form fields, so
 * without this an attacker could craft a sign-in link that bounces the user
 * to "//evil.example" or "https://evil.example" after they authenticate.
 */
export function safeRedirectPath(value: unknown, fallback: string): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) return fallback;
  // Must be a root-relative path. "//host" and "/\host" are protocol-relative
  // to browsers; control characters can smuggle either past naive checks.
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;

  const base = "http://workledger.invalid";
  try {
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
