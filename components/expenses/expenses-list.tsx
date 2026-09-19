"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteExpenseAction } from "@/lib/actions/expenses";
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

  if (expenses.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No expenses recorded yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Job</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>{expense.expense_date}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {expense.category}
              </Badge>
            </TableCell>
            <TableCell>{expense.job?.name ?? "—"}</TableCell>
            <TableCell className="max-w-xs truncate">{expense.description ?? "—"}</TableCell>
            <TableCell className="text-right tabular-nums">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: expense.currency }).format(
                expense.amount
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
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
