"use client";

import "./globals.css";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";
import { MESSAGES } from "@/lib/i18n/messages";

/** Renders in place of the root layout (so outside I18nProvider): read the language cookie directly. */
function cookieLocale() {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const value = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = cookieLocale();
  const m = MESSAGES[locale];
  return (
    <html lang={locale}>
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">{m.errorPage.globalTitle}</h1>
          <p className="max-w-sm text-sm text-muted-foreground">{m.errorPage.globalBody}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          {m.errorPage.tryAgain}
        </button>
      </body>
    </html>
  );
}
