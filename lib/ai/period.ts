import { getLocalDayBounds, getLocalMonthBounds, getWorkweekBounds } from "@/lib/calculations";

export const PERIOD_VALUES = [
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "custom",
] as const;

export type Period = (typeof PERIOD_VALUES)[number];

export interface PeriodContext {
  timezone: string;
  weekStartsOn: number;
  now: Date;
}

/**
 * Resolves a coarse period keyword (as chosen by the AI assistant) into
 * exact instant bounds, using the same DST-safe calculation engine the rest
 * of the app relies on. Custom ranges must supply startDate/endDate
 * (YYYY-MM-DD, interpreted in the user's timezone).
 */
export function resolvePeriod(
  period: Period,
  ctx: PeriodContext,
  custom?: { startDate?: string; endDate?: string }
): { start: Date; end: Date; label: string } {
  const { timezone, weekStartsOn, now } = ctx;

  switch (period) {
    case "today": {
      const { start, end } = getLocalDayBounds(now, timezone);
      return { start, end, label: "today" };
    }
    case "yesterday": {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const { start, end } = getLocalDayBounds(yesterday, timezone);
      return { start, end, label: "yesterday" };
    }
    case "this_week": {
      const { start, end } = getWorkweekBounds(now, timezone, weekStartsOn);
      return { start, end, label: "this week" };
    }
    case "last_week": {
      const { start: thisWeekStart } = getWorkweekBounds(now, timezone, weekStartsOn);
      const lastWeekAnchor = new Date(thisWeekStart.getTime() - 24 * 60 * 60 * 1000);
      const { start, end } = getWorkweekBounds(lastWeekAnchor, timezone, weekStartsOn);
      return { start, end, label: "last week" };
    }
    case "this_month": {
      const { start, end } = getLocalMonthBounds(now, timezone);
      return { start, end, label: "this month" };
    }
    case "last_month": {
      const { start: thisMonthStart } = getLocalMonthBounds(now, timezone);
      const lastMonthAnchor = new Date(thisMonthStart.getTime() - 24 * 60 * 60 * 1000);
      const { start, end } = getLocalMonthBounds(lastMonthAnchor, timezone);
      return { start, end, label: "last month" };
    }
    case "custom": {
      if (!custom?.startDate || !custom?.endDate) {
        throw new Error("custom period requires startDate and endDate");
      }
      const { start } = getLocalDayBounds(`${custom.startDate}T12:00:00`, timezone);
      const { end } = getLocalDayBounds(`${custom.endDate}T12:00:00`, timezone);
      return { start, end: new Date(end.getTime()), label: `${custom.startDate} to ${custom.endDate}` };
    }
    default: {
      const _exhaustive: never = period;
      throw new Error(`Unknown period: ${_exhaustive}`);
    }
  }
}
