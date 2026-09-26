import { z } from "zod";

import { LOCALES } from "@/lib/i18n/config";
import { v } from "@/lib/i18n/validation";
import { isValidTimeZone } from "@/lib/timezone";

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, v("nameRequired")).max(200),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  defaultHourlyRate: z.coerce.number().min(0).max(100000).optional(),
});

export const timeZoneSchema = z.string().refine(isValidTimeZone, v("timezoneInvalid"));

export const regionSchema = z.object({
  locale: z.enum(LOCALES, v("localeInvalid")),
  timezone: timeZoneSchema,
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, v("currencyInvalid")),
});

export const preferencesSchema = z.object({
  weekStartsOn: z.coerce.number().int().min(0).max(6),
  defaultBreakMinutes: z.coerce.number().int().min(0).max(480),
  overtimeEnabled: z.coerce.boolean(),
  overtimeThresholdHours: z.coerce.number().min(0).max(168),
  notificationsEnabled: z.coerce.boolean(),
});

export const taxSettingsSchema = z
  .object({
    taxCountry: z.enum(["CA", "US"]).optional().or(z.literal("")),
    taxRegion: z.string().trim().max(10).optional().or(z.literal("")),
    taxCity: z.string().trim().max(30).optional().or(z.literal("")),
  })
  .refine((data) => !data.taxCountry || !!data.taxRegion, {
    message: v("chooseRegion"),
    path: ["taxRegion"],
  });
