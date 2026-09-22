import { fromZonedTime, toZonedTime } from "date-fns-tz";

export type PayFrequency = "weekly" | "biweekly" | "semi_monthly" | "monthly";

/**
 * Converts a value representing a *calendar date* (e.g. a Postgres `date`
 * column, which carries no time zone of its own) into the instant of local
 * midnight for that calendar date in `timezone`. A bare "YYYY-MM-DD" string
 * is parsed as calendar components directly -- never through `new
 * Date(string)`, which the JS spec parses as UTC midnight and would shift
 * the date backward by a day in any zone behind UTC. A `Date` (a true
 * instant) is first resolved to its calendar date in `timezone`.
 */
function localMidnight(value: Date | string, timezone: string): Date {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return fromZonedTime(new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)), timezone);
  }

  const instant = value instanceof Date ? value : new Date(value);
  const zoned = toZonedTime(instant, timezone);
  const utcOfLocalCalendarDate = new Date(
    Date.UTC(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), 0, 0, 0, 0)
  );
  return fromZonedTime(utcOfLocalCalendarDate, timezone);
}

/** Local calendar-date components (in `timezone`) for an instant produced by `localMidnight`. */
function calendarParts(localMidnightInstant: Date, timezone: string): { year: number; month: number; day: number } {
  const zoned = toZonedTime(localMidnightInstant, timezone);
  return { year: zoned.getFullYear(), month: zoned.getMonth(), day: zoned.getDate() };
}

function addDays(localMidnightInstant: Date, days: number, timezone: string): Date {
  const { year, month, day } = calendarParts(localMidnightInstant, timezone);
  return fromZonedTime(new Date(Date.UTC(year, month, day + days, 0, 0, 0, 0)), timezone);
}

function addMonths(localMidnightInstant: Date, months: number, timezone: string): Date {
  const { year, month, day } = calendarParts(localMidnightInstant, timezone);
  return fromZonedTime(new Date(Date.UTC(year, month + months, day, 0, 0, 0, 0)), timezone);
}

/**
 * Given a known past (or future) pay date and a frequency, returns the next
 * pay date at or after `from`. `anchorDate` is a calendar date (see
 * `localMidnight`); `from` is a true instant, defaulting to now.
 */
export function getNextPayday(
  anchorDate: Date | string,
  frequency: PayFrequency,
  timezone: string,
  from: Date = new Date()
): Date {
  const anchor = localMidnight(anchorDate, timezone);
  const fromDay = localMidnight(from, timezone);

  if (fromDay <= anchor) return anchor;

  if (frequency === "semi_monthly") {
    const anchorDayOfMonth = calendarParts(anchor, timezone).day;
    const secondDayOfMonth = ((anchorDayOfMonth + 14 - 1) % 28) + 1;
    const paydays = [anchorDayOfMonth, secondDayOfMonth].sort((a, b) => a - b);

    let candidate = anchor;
    for (let i = 0; i < 62; i++) {
      if (candidate >= fromDay && paydays.includes(calendarParts(candidate, timezone).day)) {
        return candidate;
      }
      candidate = addDays(candidate, 1, timezone);
    }
    return candidate; // unreachable given the loop bound
  }

  if (frequency === "monthly") {
    let candidate = anchor;
    while (candidate < fromDay) {
      candidate = addMonths(candidate, 1, timezone);
    }
    return candidate;
  }

  const intervalDays = frequency === "weekly" ? 7 : 14;
  const daysSinceAnchor = Math.round((fromDay.getTime() - anchor.getTime()) / 86_400_000);
  const cyclesElapsed = Math.ceil(daysSinceAnchor / intervalDays);
  return addDays(anchor, cyclesElapsed * intervalDays, timezone);
}

/** Number of pay periods per year for a given frequency (average, for semi-monthly/monthly). */
export function payPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "weekly":
      return 52;
    case "biweekly":
      return 26;
    case "semi_monthly":
      return 24;
    case "monthly":
      return 12;
  }
}
