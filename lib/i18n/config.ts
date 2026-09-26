export const LOCALES = ["en", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie holding the active UI language (mirrors `profiles.locale` once signed in). */
export const LOCALE_COOKIE = "wl-locale";

/** Each language's name in that language, for the picker. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};

/**
 * The BCP 47 tag used for number/date/currency formatting. French defaults to
 * Canadian conventions and Spanish to US conventions, matching the app's
 * Canada + US scope (e.g. "1 234,56 $" rather than "1 234,56 $ CA").
 */
export const INTL_LOCALES: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-CA",
  es: "es-US",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Picks the best supported locale from an Accept-Language header, by q-weight. */
export function matchAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { base: tag.trim().toLowerCase().split("-")[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);

  return ranked.find((entry) => isLocale(entry.base))?.base as Locale | undefined ?? DEFAULT_LOCALE;
}

/** Substitutes `{name}` placeholders in a message. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}
