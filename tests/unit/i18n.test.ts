import { describe, expect, it } from "vitest";

import { LOCALES } from "@/lib/i18n/config";
import { MESSAGES } from "@/lib/i18n/messages";
import { en } from "@/lib/i18n/messages/en";
import { validationMessage, v } from "@/lib/i18n/validation";
import { z } from "zod";

type Leaf = [path: string, value: string];

function leaves(value: unknown, path = ""): Leaf[] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, i) => leaves(item, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => leaves(child, path ? `${path}.${key}` : key));
  }
  throw new Error(`Unexpected value at ${path}`);
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe("message dictionaries", () => {
  const english = new Map(leaves(en));

  // Types already force the same keys; these catch what types can't:
  // array lengths, placeholder names, and untranslated/empty strings.
  for (const locale of LOCALES.filter((l) => l !== "en")) {
    describe(locale, () => {
      const translated = new Map(leaves(MESSAGES[locale]));

      it("has exactly the same entries as English (including array items)", () => {
        expect([...translated.keys()].sort()).toEqual([...english.keys()].sort());
      });

      it("uses the same {placeholders} as English in every string", () => {
        for (const [path, text] of english) {
          expect({ path, placeholders: placeholders(translated.get(path) ?? "") }).toEqual({
            path,
            placeholders: placeholders(text),
          });
        }
      });

      it("has no empty strings", () => {
        for (const [path, text] of translated) expect({ path, empty: text.trim() === "" }).toEqual({ path, empty: false });
      });

      it("is actually translated (most strings differ from English)", () => {
        const same = [...translated].filter(([path, text]) => english.get(path) === text).length;
        expect(same / translated.size).toBeLessThan(0.15);
      });
    });
  }
});

describe("validationMessage", () => {
  const schema = z.object({ email: z.email(v("emailInvalid")) });

  it("translates a validation key into the active language", () => {
    const result = schema.safeParse({ email: "nope" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(validationMessage(MESSAGES.en, result.error)).toBe(en.validation.emailInvalid);
    expect(validationMessage(MESSAGES.fr, result.error)).toBe(MESSAGES.fr.validation.emailInvalid);
    expect(validationMessage(MESSAGES.es, result.error)).toBe(MESSAGES.es.validation.emailInvalid);
  });

  it("falls back to a generic message for issues without a key", () => {
    const result = z.object({ n: z.number().max(3) }).safeParse({ n: 9 });
    if (result.success) throw new Error("expected failure");
    expect(validationMessage(MESSAGES.fr, result.error)).toBe(MESSAGES.fr.errors.invalidInput);
  });
});
