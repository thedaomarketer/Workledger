import { z } from "zod";

export const jobSchema = z.object({
  name: z.string().trim().min(1, "Job name is required.").max(200),
  companyName: z.string().trim().max(200).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  hourlyRate: z.coerce.number().min(0).max(100000).optional(),
  overtimeRate: z.coerce.number().min(0).max(100000).optional(),
  overtimeThresholdHours: z.coerce.number().min(0).max(168).optional(),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color."),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type JobInput = z.infer<typeof jobSchema>;
