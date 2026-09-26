import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

/**
 * Conversions between wall-clock values a user types or sees ("2024-06-10",
 * "09:00") and absolute instants, always in the user's own time zone.
 *
 * The server runs in UTC, so `new Date("2024-06-10T09:00")` there means 09:00
 * UTC -- five hours off for a Toronto user. Everything that turns form input
 * into a stored timestamp (or a stored timestamp back into form input) goes
 * through here instead.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

export function isDateString(value: string): boolean {
  return DATE_RE.test(value);
}

export function isMonthString(value: string): boolean {
  return MONTH_RE.test(value);
}

/** The instant a local date + time (e.g. "2024-06-10", "09:00") refers to in `timezone`. */
export function localDateTimeToInstant(date: string, time: string, timezone: string): Date {
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) {
    throw new RangeError(`Invalid local date/time: ${date} ${time}`);
  }
  return fromZonedTime(`${date}T${time}:00`, timezone);
}

/** The instant of local midnight at the start of `date` in `timezone`. */
export function localDayStart(date: string, timezone: string): Date {
  return localDateTimeToInstant(date, "00:00", timezone);
}

/** Calendar arithmetic on a "yyyy-mm-dd" string (no time zone involved). */
export function addDaysToDateString(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Calendar arithmetic on a "yyyy-mm" string. */
export function addMonthsToMonthString(month: string, months: number): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + months, 1)).toISOString().slice(0, 7);
}

/** The local calendar date ("yyyy-mm-dd") of an instant in `timezone`. */
export function localDateString(instant: Date | string, timezone: string): string {
  return formatInTimeZone(instant, timezone, "yyyy-MM-dd");
}

/** The local calendar month ("yyyy-mm") of an instant in `timezone`. */
export function localMonthString(instant: Date | string, timezone: string): string {
  return formatInTimeZone(instant, timezone, "yyyy-MM");
}

/** An instant as the { date, time } pair a date/time form input expects, in `timezone`. */
export function instantToLocalInputs(instant: Date | string, timezone: string): { date: string; time: string } {
  return {
    date: formatInTimeZone(instant, timezone, "yyyy-MM-dd"),
    time: formatInTimeZone(instant, timezone, "HH:mm"),
  };
}

/**
 * Resolves a manually entered shift to absolute instants. With no explicit
 * end date, an end time at or before the start time means the shift crossed
 * midnight, so the end lands on the next *calendar* day -- not start + 24h,
 * which would be an hour off on a DST-change night.
 */
export function resolveLocalShiftRange(
  input: { date: string; startTime: string; endTime: string; endDate?: string },
  timezone: string
): { start: Date; end: Date } {
  const start = localDateTimeToInstant(input.date, input.startTime, timezone);

  if (input.endDate) {
    return { start, end: localDateTimeToInstant(input.endDate, input.endTime, timezone) };
  }

  let end = localDateTimeToInstant(input.date, input.endTime, timezone);
  if (end <= start) {
    end = localDateTimeToInstant(addDaysToDateString(input.date, 1), input.endTime, timezone);
  }
  return { start, end };
}
