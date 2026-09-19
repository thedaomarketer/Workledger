import { fromZonedTime, toZonedTime } from "date-fns-tz";

/** [start, end) instants for the local calendar day containing `instant`. */
export function getLocalDayBounds(instant: Date | string, timezone: string): { start: Date; end: Date } {
  const date = instant instanceof Date ? instant : new Date(instant);
  const zoned = toZonedTime(date, timezone);

  const localStart = new Date(zoned);
  localStart.setHours(0, 0, 0, 0);
  const localEnd = new Date(localStart);
  localEnd.setDate(localStart.getDate() + 1);

  return { start: fromZonedTime(localStart, timezone), end: fromZonedTime(localEnd, timezone) };
}

/** [start, end) instants for the local calendar month containing `instant`. */
export function getLocalMonthBounds(instant: Date | string, timezone: string): { start: Date; end: Date } {
  const date = instant instanceof Date ? instant : new Date(instant);
  const zoned = toZonedTime(date, timezone);

  const localStart = new Date(zoned.getFullYear(), zoned.getMonth(), 1, 0, 0, 0, 0);
  const localEnd = new Date(zoned.getFullYear(), zoned.getMonth() + 1, 1, 0, 0, 0, 0);

  return { start: fromZonedTime(localStart, timezone), end: fromZonedTime(localEnd, timezone) };
}
