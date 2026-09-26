"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteExpenseAction } from "@/lib/actions/expenses";
import { dollarsToCents, formatCents } from "@/lib/calculations/money";
import { formatCalendarDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExpenseCategory } from "@/lib/supabase/database.types";

export interface ExpenseRow {
  id: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string | null;
  expense_date: string;
  job: { name: string; color: string } | null;
}

export function ExpensesList({ expenses }: { expenses: ExpenseRow[] }) {
  const [isPending, startTransition] = useTransition();
  const { intl, m } = useI18n();

  if (expenses.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{m.expenses.empty}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{m.common.date}</TableHead>
          <TableHead>{m.common.category}</TableHead>
          <TableHead>{m.common.job}</TableHead>
          <TableHead>{m.common.description}</TableHead>
          <TableHead className="text-right">{m.common.amount}</TableHead>
          <TableHead className="text-right">{m.common.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="whitespace-nowrap">{formatCalendarDate(expense.expense_date, intl)}</TableCell>
            <TableCell>
              <Badge variant="outline">{m.expenses.categories[expense.category]}</Badge>
            </TableCell>
            <TableCell>{expense.job?.name ?? "—"}</TableCell>
            <TableCell className="max-w-xs truncate">{expense.description ?? "—"}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCents(dollarsToCents(expense.amount), expense.currency, intl)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                aria-label={m.expenses.deleteExpense}
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteExpenseAction(expense.id);
                    if (result.error) toast.error(result.error);
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
