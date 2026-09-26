import type { Messages } from "./messages/en";

export type ValidationKey = keyof Messages["validation"];

/**
 * Zod schemas in lib/validation use a validation-message *key* as their error
 * message (typed through this helper, so a typo fails typecheck); server
 * actions translate it with `validationMessage`.
 */
export function v(key: ValidationKey): ValidationKey {
  return key;
}

/** Translates the first Zod issue, or falls back to a generic message for Zod's own built-in errors. */
export function validationMessage(m: Messages, error: { issues: { message: string }[] }): string {
  const key = error.issues[0]?.message;
  return key && key in m.validation ? m.validation[key as ValidationKey] : m.errors.invalidInput;
}
