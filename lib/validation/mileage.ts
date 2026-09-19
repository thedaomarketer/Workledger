import { z } from "zod";

export const mileageEntrySchema = z.object({
  jobId: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Choose a date."),
  startLocation: z.string().trim().max(200).optional().or(z.literal("")),
  endLocation: z.string().trim().max(200).optional().or(z.literal("")),
  distance: z.coerce.number().positive("Enter a distance greater than 0."),
  unit: z.enum(["km", "mi"]),
  rate: z.coerce.number().min(0).default(0),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type MileageEntryInput = z.infer<typeof mileageEntrySchema>;
