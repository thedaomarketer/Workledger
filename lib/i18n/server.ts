import "server-only";

import { cookies, headers } from "next/headers";

import { DEFAULT_LOCALE, INTL_LOCALES, LOCALE_COOKIE, isLocale, matchAcceptLanguage, type Locale } from "./config";
import { MESSAGES, type Messages } from "./messages";

export interface I18n {
  locale: Locale;
  /** BCP 47 tag for Intl formatting, e.g. "fr-CA". */
  intl: string;
  m: Messages;
}

/**
 * The active UI language: the `wl-locale` cookie (set from the user's saved
 * preference, or by the language switcher when signed out), falling back to
 * the browser's Accept-Language.
 */
export async function getLocale(): Promise<Locale> {
  const cookieValue = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieValue)) return cookieValue;
  try {
    return matchAcceptLanguage((await headers()).get("accept-language"));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export async function getI18n(): Promise<I18n> {
  const locale = await getLocale();
  return { locale, intl: INTL_LOCALES[locale], m: MESSAGES[locale] };
}

/** Persists the UI language for a year (not httpOnly: it's a display preference, not a credential). */
export async function setLocaleCookie(locale: Locale): Promise<void> {
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
