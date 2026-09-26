import { z } from "zod";

import { v } from "@/lib/i18n/validation";

export const expenseSchema = z.object({
  jobId: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().positive(v("amountPositive")),
  category: z.enum(["meals", "transport", "supplies", "equipment", "lodging", "other"]),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  expenseDate: z.string().min(1, v("chooseDate")),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
