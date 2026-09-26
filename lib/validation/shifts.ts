import { z } from "zod";

import { v } from "@/lib/i18n/validation";

/**
 * Wall-clock values as typed into the form. Turning them into instants needs
 * the user's time zone, so that happens in the action via
 * `resolveLocalShiftRange` -- never with `new Date("…T09:00")` on the server,
 * which would read the time as UTC.
 */
export const manualShiftSchema = z.object({
  jobId: z.uuid(v("chooseJob")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, v("chooseDate")),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, v("startTimeRequired")),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, v("endTimeRequired")),
  breakMinutes: z.coerce.number().int().min(0).max(24 * 60).default(0),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  /** yyyy-mm-dd of the end date, when a shift crosses midnight. */
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
});

export type ManualShiftInput = z.infer<typeof manualShiftSchema>;

export const breakSchema = z.object({
  isPaid: z.coerce.boolean().default(false),
});
