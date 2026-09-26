import { z } from "zod";

import { LOCALES } from "@/lib/i18n/config";
import { v } from "@/lib/i18n/validation";
import { isValidTimeZone } from "@/lib/timezone";

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, v("nameRequired")).max(200),
  email: z.email(v("emailInvalid")),
  password: z.string().min(8, v("passwordMin")),
  /**
   * Detected by the browser, never typed. Anything unusable is dropped rather
   * than failing signup: the account then falls back to UTC / English (the
   * database trigger re-validates both, since signup metadata is
   * client-controlled).
   */
  timezone: z
    .string()
    .optional()
    .transform((value) => (isValidTimeZone(value) ? value : undefined)),
  locale: z.enum(LOCALES).optional().catch(undefined),
});

export const signInSchema = z.object({
  email: z.email(v("emailInvalid")),
  password: z.string().min(1, v("passwordRequired")),
});

export const requestPasswordResetSchema = z.object({
  email: z.email(v("emailInvalid")),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, v("passwordMin")),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: v("passwordsMismatch"),
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
