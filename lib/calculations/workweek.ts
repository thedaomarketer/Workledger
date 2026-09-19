import { fromZonedTime, toZonedTime } from "date-fns-tz";

/**
 * Returns the [weekStart, weekEnd) instants (as absolute Date objects) for
 * the workweek containing `instant`, evaluated in `timezone`. `weekStartsOn`
 * follows the JS Date convention: 0 = Sunday, 1 = Monday, ... 6 = Saturday.
 *
 * The boundary is computed against the user's local calendar day so that,
 * for example, a Monday-start workweek always begins at local midnight on
 * Monday regardless of DST shifts within the week.
 */
export function getWorkweekBounds(
  instant: Date | string,
  timezone: string,
  weekStartsOn: number
): { start: Date; end: Date } {
  const date = instant instanceof Date ? instant : new Date(instant);
  const zoned = toZonedTime(date, timezone);

  const zonedDay = zoned.getDay();
  const daysSinceWeekStart = (zonedDay - weekStartsOn + 7) % 7;

  const localWeekStart = new Date(zoned);
  localWeekStart.setDate(zoned.getDate() - daysSinceWeekStart);
  localWeekStart.setHours(0, 0, 0, 0);

  const localWeekEnd = new Date(localWeekStart);
  localWeekEnd.setDate(localWeekStart.getDate() + 7);

  return {
    start: fromZonedTime(localWeekStart, timezone),
    end: fromZonedTime(localWeekEnd, timezone),
  };
}

/** Buckets shifts into workweeks keyed by the workweek's start instant (ISO string). */
export function groupByWorkweek<T extends { start: Date | string }>(
  items: T[],
  timezone: string,
  weekStartsOn: number
): Map<string, T[]> {
  const buckets = new Map<string, T[]>();

  for (const item of items) {
    const { start } = getWorkweekBounds(item.start, timezone, weekStartsOn);
    const key = start.toISOString();
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      buckets.set(key, [item]);
    }
  }

  return buckets;
}
