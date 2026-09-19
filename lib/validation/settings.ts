import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name.").max(200),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  timezone: z.string().min(1, "Choose a time zone."),
  currency: z.string().length(3, "Use a 3-letter currency code."),
  dateFormat: z.string().min(1),
  defaultHourlyRate: z.coerce.number().min(0).max(100000).optional(),
});

export const preferencesSchema = z.object({
  weekStartsOn: z.coerce.number().int().min(0).max(6),
  defaultBreakMinutes: z.coerce.number().int().min(0).max(480),
  overtimeEnabled: z.coerce.boolean(),
  overtimeThresholdHours: z.coerce.number().min(0).max(168),
  notificationsEnabled: z.coerce.boolean(),
});
