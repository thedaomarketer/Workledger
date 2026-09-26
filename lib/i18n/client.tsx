"use client";

import { createContext, useContext } from "react";

import { INTL_LOCALES, type Locale } from "./config";
import type { Messages } from "./messages/en";

interface I18nValue {
  locale: Locale;
  intl: string;
  m: Messages;
}

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Receives only the active language's messages from the server layout, so the
 * client bundle never ships the other dictionaries.
 */
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, intl: INTL_LOCALES[locale], m: messages }}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>.");
  return value;
}
