import { z } from "zod";

export const expenseSchema = z.object({
  jobId: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().positive("Enter an amount greater than 0."),
  category: z.enum(["meals", "transport", "supplies", "equipment", "lodging", "other"]),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  expenseDate: z.string().min(1, "Choose a date."),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
