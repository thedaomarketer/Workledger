"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";

import { setLanguageAction } from "@/lib/actions/language";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/** Compact language picker for signed-out pages; signed-in users use Settings → Language & region. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, m } = useI18n();
  const [isPending, startTransition] = useTransition();

  return (
    <label
      className={cn(
        "relative flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground transition-colors focus-within:ring-[3px] focus-within:ring-ring/25 hover:bg-black/[0.04]",
        isPending && "opacity-60",
        className
      )}
    >
      <Globe className="size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{m.common.language}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value as Locale;
          startTransition(() => setLanguageAction(next));
        }}
        className="cursor-pointer appearance-none bg-transparent pr-1 font-medium text-foreground outline-none"
      >
        {LOCALES.map((value) => (
          <option key={value} value={value} lang={value}>
            {LOCALE_NAMES[value]}
          </option>
        ))}
      </select>
    </label>
  );
}
