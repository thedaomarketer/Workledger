import { z } from "zod";

export const manualShiftSchema = z
  .object({
    jobId: z.uuid("Choose a job."),
    date: z.string().min(1, "Choose a date."),
    startTime: z.string().min(1, "Enter a start time."),
    endTime: z.string().min(1, "Enter an end time."),
    breakMinutes: z.coerce.number().int().min(0).max(24 * 60).default(0),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
    /** yyyy-mm-dd of the end date, when a shift crosses midnight. */
    endDate: z.string().optional().or(z.literal("")),
  })
  .transform((data) => {
    const start = new Date(`${data.date}T${data.startTime}`);
    const endDateStr = data.endDate || data.date;
    let end = new Date(`${endDateStr}T${data.endTime}`);
    // If no explicit end date was given and the end time is earlier than
    // the start time, assume the shift crosses midnight.
    if (!data.endDate && end <= start) {
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    }
    return { ...data, start, end };
  });

export type ManualShiftInput = z.infer<typeof manualShiftSchema>;

export const breakSchema = z.object({
  isPaid: z.coerce.boolean().default(false),
});
