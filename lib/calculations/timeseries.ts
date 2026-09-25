import { getWorkweekBounds, groupByWorkweek } from "./workweek";
import { summarizeShiftsByJob, sumJobSummaries, type JobRateConfig, type ShiftSummaryInput } from "./summary";

export interface WeeklyTotals {
  weekStart: Date;
  weekEnd: Date;
  paidMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  earningsCents: number;
}

/**
 * Buckets shifts into consecutive workweeks covering [rangeStart, rangeEnd),
 * summing each week with the same overtime/earnings math as every other
 * report. A week with no shifts still appears with all-zero totals (a real
 * gap in a trend chart), rather than being skipped.
 *
 * Advances one week at a time using the *previous* week's own `end`
 * boundary (already computed via local-calendar-day arithmetic in
 * `getWorkweekBounds`) rather than adding a fixed 7-day duration -- so this
 * stays correct across a DST transition inside the range.
 */
export function summarizeByWeek(
  shifts: ShiftSummaryInput[],
  jobRates: Record<string, JobRateConfig>,
  timezone: string,
  weekStartsOn: number,
  rangeStart: Date,
  rangeEnd: Date
): WeeklyTotals[] {
  const buckets = groupByWorkweek(shifts, timezone, weekStartsOn);
  const weeks: WeeklyTotals[] = [];

  let cursor = rangeStart;
  while (cursor < rangeEnd) {
    const { start, end } = getWorkweekBounds(cursor, timezone, weekStartsOn);
    const weekShifts = buckets.get(start.toISOString()) ?? [];
    const totals = sumJobSummaries(summarizeShiftsByJob(weekShifts, jobRates));

    weeks.push({ weekStart: start, weekEnd: end, ...totals });
    cursor = end;
  }

  return weeks;
}
