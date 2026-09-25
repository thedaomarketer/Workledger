import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/data/context";
import { getLocalMonthBounds } from "@/lib/calculations";
import { CreateExpenseDialog } from "@/components/expenses/create-expense-dialog";
import { ExpensesList } from "@/components/expenses/expenses-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ExpensesPage() {
  const ctx = await requireUserContext();
  if (!ctx) return null;

  const supabase = await createClient();
  const { start, end } = getLocalMonthBounds(new Date(), ctx.timezone);

  const [{ data: expenses }, { data: jobs }] = await Promise.all([
    supabase
      .from("expenses")
      .select("*, job:jobs(name, color)")
      .eq("user_id", ctx.userId)
      .order("expense_date", { ascending: false })
      .limit(200),
    supabase.from("jobs").select("id, name").eq("user_id", ctx.userId).eq("is_active", true),
  ]);

  const monthTotal = (expenses ?? [])
    .filter((e) => e.expense_date >= start.toISOString().slice(0, 10) && e.expense_date < end.toISOString().slice(0, 10))
    .reduce((sum, e) => sum + e.amount, 0);

  const byCategory = new Map<string, number>();
  for (const e of expenses ?? []) {
    if (e.expense_date >= start.toISOString().slice(0, 10) && e.expense_date < end.toISOString().slice(0, 10)) {
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight md:text-3xl">Expenses</h1>
        <CreateExpenseDialog jobs={jobs ?? []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">This month</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-3xl font-semibold tabular-nums">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: ctx.currency }).format(monthTotal)}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            {[...byCategory.entries()].map(([category, amount]) => (
              <span key={category} className="capitalize">
                {category}{" "}
                <span className="font-medium text-foreground">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: ctx.currency }).format(amount)}
                </span>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0 pt-6 sm:px-6">
          <ExpensesList expenses={expenses ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
