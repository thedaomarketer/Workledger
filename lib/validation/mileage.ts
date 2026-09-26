import { z } from "zod";

import { v } from "@/lib/i18n/validation";

export const mileageEntrySchema = z.object({
  jobId: z.string().optional().or(z.literal("")),
  date: z.string().min(1, v("chooseDate")),
  startLocation: z.string().trim().max(200).optional().or(z.literal("")),
  endLocation: z.string().trim().max(200).optional().or(z.literal("")),
  distance: z.coerce.number().positive(v("distancePositive")),
  unit: z.enum(["km", "mi"]),
  rate: z.coerce.number().min(0).default(0),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type MileageEntryInput = z.infer<typeof mileageEntrySchema>;
