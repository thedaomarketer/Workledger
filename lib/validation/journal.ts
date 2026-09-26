import { z } from "zod";

import { v } from "@/lib/i18n/validation";

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
  eventAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, v("chooseDateTime")),
});

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
