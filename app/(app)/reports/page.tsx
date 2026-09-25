import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/data/context";
import {
  dollarsToCents,
  formatCents,
  getLocalMonthBounds,
  summarizeByWeek,
  summarizeShiftsByJob,
  sumJobSummaries,
} from "@/lib/calculations";
import { formatMinutesAsHours } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { TimeSeriesBarChart } from "@/components/charts/time-series-bar-chart";
import { CategoryBarChart } from "@/components/charts/category-bar-chart";

const MAX_TREND_WEEKS = 16;

const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  meals: "var(--chart-1)",
  transport: "var(--chart-2)",
  supplies: "var(--chart-3)",
  equipment: "var(--chart-4)",
  lodging: "var(--chart-5)",
  other: "var(--chart-6)",
};

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatWeekLabel(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: timezone }).format(date);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const ctx = await requireUserContext();
  if (!ctx) return null;

  const defaultRange = getLocalMonthBounds(new Date(), ctx.timezone);
  const rangeStart = params.start ? new Date(`${params.start}T00:00:00`) : defaultRange.start;
  const rangeEnd = params.end ? new Date(`${params.end}T23:59:59.999`) : defaultRange.end;

  const supabase = await createClient();
  const [{ data: jobs }, { data: shifts }, { data: expenses }, { data: mileage }] = await Promise.all([
    supabase.from("jobs").select("*").eq("user_id", ctx.userId),
    supabase
      .from("shifts")
      .select("*, breaks(*)")
      .eq("user_id", ctx.userId)
      .eq("status", "completed")
      .gte("actual_start", rangeStart.toISOString())
      .lt("actual_start", rangeEnd.toISOString()),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", ctx.userId)
      .gte("expense_date", toDateInputValue(rangeStart))
      .lte("expense_date", toDateInputValue(rangeEnd)),
    supabase
      .from("mileage_entries")
      .select("*")
      .eq("user_id", ctx.userId)
      .gte("date", toDateInputValue(rangeStart))
      .lte("date", toDateInputValue(rangeEnd)),
  ]);

  const jobRates = Object.fromEntries(
    (jobs ?? []).map((job) => [
      job.id,
      {
        hourlyRateCents: job.hourly_rate ? dollarsToCents(job.hourly_rate) : 0,
        overtimeRateCents: job.overtime_rate ? dollarsToCents(job.overtime_rate) : null,
        overtimeThresholdMinutes: job.overtime_threshold_minutes,
      },
    ])
  );

  const shiftInputs = (shifts ?? [])
    .filter((s) => s.actual_start)
    .map((s) => ({
      jobId: s.job_id,
      start: s.actual_start!,
      end: s.actual_end,
      breaks: s.breaks.map((b) => ({ startedAt: b.started_at, endedAt: b.ended_at, isPaid: b.is_paid })),
    }));

  const summaries = summarizeShiftsByJob(shiftInputs, jobRates);

  const totals = sumJobSummaries(summaries);
  const totalExpenses = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);
  const totalMileage = (mileage ?? []).reduce((sum, m) => sum + m.reimbursement, 0);

  const jobsById = new Map((jobs ?? []).map((j) => [j.id, j]));
  const csvParams = new URLSearchParams({
    start: toDateInputValue(rangeStart),
    end: toDateInputValue(rangeEnd),
  }).toString();

  const weeklyTotals = summarizeByWeek(shiftInputs, jobRates, ctx.timezone, ctx.weekStartsOn, rangeStart, rangeEnd);
  const showWeeklyTrend = weeklyTotals.length > 1 && weeklyTotals.length <= MAX_TREND_WEEKS;

  const weeklyHoursData = weeklyTotals.map((week) => ({
    label: formatWeekLabel(week.weekStart, ctx.timezone),
    values: { regular: week.regularMinutes, overtime: week.overtimeMinutes },
  }));
  const weeklyEarningsData = weeklyTotals.map((week) => ({
    label: formatWeekLabel(week.weekStart, ctx.timezone),
    values: { earnings: week.earningsCents },
  }));

  const hoursByJobData = Object.entries(summaries).map(([jobId, summary]) => ({
    label: jobsById.get(jobId)?.name ?? "Unknown job",
    value: summary.paidMinutes,
    color: jobsById.get(jobId)?.color ?? "var(--chart-1)",
  }));
  const earningsByJobData = Object.entries(summaries).map(([jobId, summary]) => ({
    label: jobsById.get(jobId)?.name ?? "Unknown job",
    value: summary.earningsCents,
    color: jobsById.get(jobId)?.color ?? "var(--chart-1)",
  }));

  const expensesByCategory = new Map<string, number>();
  for (const expense of expenses ?? []) {
    expensesByCategory.set(expense.category, (expensesByCategory.get(expense.category) ?? 0) + expense.amount);
  }
  const expensesByCategoryData = [...expensesByCategory.entries()].map(([category, amount]) => ({
    label: capitalize(category),
    value: amount,
    color: EXPENSE_CATEGORY_COLORS[category] ?? "var(--chart-6)",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight md:text-3xl">Reports</h1>
        <form className="flex flex-wrap items-end gap-2" action="/reports">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="start">
              From
            </label>
            <input
              id="start"
              name="start"
              type="date"
              defaultValue={toDateInputValue(rangeStart)}
              className="flex h-10 rounded-xl bg-card px-3 text-base shadow-[0_1px_2px_rgb(0_0_0/0.05)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 md:text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="end">
              To
            </label>
            <input
              id="end"
              name="end"
              type="date"
              defaultValue={toDateInputValue(rangeEnd)}
              className="flex h-10 rounded-xl bg-card px-3 text-base shadow-[0_1px_2px_rgb(0_0_0/0.05)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 md:text-sm"
            />
          </div>
          <Button type="submit" variant="outline">
            Apply
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="gap-1.5">
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Total hours</CardTitle>
          </CardHeader>
          <CardContent className="text-[26px] leading-tight font-bold tracking-tight">{formatMinutesAsHours(totals.paidMinutes)}</CardContent>
        </Card>
        <Card className="gap-1.5">
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Overtime</CardTitle>
          </CardHeader>
          <CardContent className="text-[26px] leading-tight font-bold tracking-tight">{formatMinutesAsHours(totals.overtimeMinutes)}</CardContent>
        </Card>
        <Card className="gap-1.5">
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Earnings</CardTitle>
          </CardHeader>
          <CardContent className="text-[26px] leading-tight font-bold tracking-tight">{formatCents(totals.earningsCents)}</CardContent>
        </Card>
        <Card className="gap-1.5">
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Expenses + mileage</CardTitle>
          </CardHeader>
          <CardContent className="text-[26px] leading-tight font-bold tracking-tight">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: ctx.currency }).format(
              totalExpenses + totalMileage
            )}
          </CardContent>
        </Card>
      </div>

      {showWeeklyTrend && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hours by week</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesBarChart
                data={weeklyHoursData}
                series={[
                  { key: "regular", label: "Regular", colorClassName: "bg-chart-1" },
                  { key: "overtime", label: "Overtime", colorClassName: "bg-chart-2" },
                ]}
                formatValue={formatMinutesAsHours}
                emptyMessage="No completed shifts in this range."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Earnings by week</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesBarChart
                data={weeklyEarningsData}
                series={[{ key: "earnings", label: "Earnings", colorClassName: "bg-chart-1" }]}
                formatValue={(cents) => formatCents(cents, ctx.currency)}
                emptyMessage="No completed shifts in this range."
              />
            </CardContent>
          </Card>
        </>
      )}

      {(hoursByJobData.length > 0 || earningsByJobData.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hours by job</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBarChart
                data={hoursByJobData}
                formatValue={formatMinutesAsHours}
                emptyMessage="No completed shifts in this range."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Earnings by job</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBarChart
                data={earningsByJobData}
                formatValue={(cents) => formatCents(cents, ctx.currency)}
                emptyMessage="No completed shifts in this range."
              />
            </CardContent>
          </Card>
        </div>
      )}

      {expensesByCategoryData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Expenses by category</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <a href="/expenses">View all</a>
            </Button>
          </CardHeader>
          <CardContent>
            <CategoryBarChart
              data={expensesByCategoryData}
              formatValue={(dollars) =>
                new Intl.NumberFormat("en-US", { style: "currency", currency: ctx.currency }).format(dollars)
              }
              emptyMessage="No expenses in this range."
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">By job</CardTitle>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={`/api/reports/csv/shifts?${csvParams}`}>
                <Download /> Hours CSV
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={`/api/reports/csv/expenses?${csvParams}`}>
                <Download /> Expenses CSV
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead className="text-right">Regular</TableHead>
                <TableHead className="text-right">Overtime</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(summaries).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No completed shifts in this range.
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(summaries).map(([jobId, summary]) => (
                  <TableRow key={jobId}>
                    <TableCell>{jobsById.get(jobId)?.name ?? "Unknown job"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMinutesAsHours(summary.regularMinutes)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMinutesAsHours(summary.overtimeMinutes)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCents(summary.earningsCents)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
