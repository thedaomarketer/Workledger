import { z } from "zod";

export const journalEntrySchema = z.object({
  entryType: z.enum([
    "general",
    "task",
    "instruction",
    "workplace_issue",
    "safety_issue",
    "schedule_change",
    "pay_issue",
    "break_issue",
    "incident",
    "other",
  ]),
  jobId: z.string().optional().or(z.literal("")),
  title: z.string().trim().max(200).optional().or(z.literal("")),
  content: z.string().trim().max(5000).optional().or(z.literal("")),
  eventAt: z.string().min(1, "Choose a date and time."),
});

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
