import type {
  BreakInterval,
  ShiftCalculationResult,
  ShiftInterval,
} from "./types";

/**
 * All calculations here operate on absolute instants (Date objects or
 * ISO-8601 strings with an offset, i.e. what Postgres TIMESTAMPTZ columns
 * produce). Because instants are unambiguous, diffing them is safe across
 * DST transitions and time zone changes -- unlike diffing naive local
 * "wall clock" strings, which the product spec explicitly forbids.
 */
function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function diffMinutes(start: Date | string, end: Date | string): number {
  const ms = toDate(end).getTime() - toDate(start).getTime();
  return Math.round(ms / 60000);
}

export function calculateBreakMinutes(
  breakInterval: BreakInterval,
  fallbackEnd?: Date | string
): number {
  const end = breakInterval.endedAt ?? fallbackEnd;
  if (!end) return 0;
  const minutes = diffMinutes(breakInterval.startedAt, end);
  return Math.max(0, minutes);
}

export function calculateShiftDuration(
  shift: ShiftInterval
): ShiftCalculationResult {
  const isComplete = shift.end !== null && shift.end !== undefined;

  if (!isComplete) {
    return {
      isComplete: false,
      grossMinutes: 0,
      unpaidBreakMinutes: 0,
      paidBreakMinutes: 0,
      paidMinutes: 0,
    };
  }

  const grossMinutes = Math.max(0, diffMinutes(shift.start, shift.end as Date | string));

  let unpaidBreakMinutes = 0;
  let paidBreakMinutes = 0;

  for (const brk of shift.breaks) {
    const minutes = calculateBreakMinutes(brk, shift.end as Date | string);
    if (brk.isPaid) {
      paidBreakMinutes += minutes;
    } else {
      unpaidBreakMinutes += minutes;
    }
  }

  // Break time can never exceed the shift's gross duration; clamp
  // defensively so a bad manual edit can't produce negative paid time.
  unpaidBreakMinutes = Math.min(unpaidBreakMinutes, grossMinutes);

  const paidMinutes = Math.max(0, grossMinutes - unpaidBreakMinutes);

  return {
    isComplete: true,
    grossMinutes,
    unpaidBreakMinutes,
    paidBreakMinutes,
    paidMinutes,
  };
}

/** True when two [start, end) shift intervals overlap in time. */
export function shiftsOverlap(
  a: { start: Date | string; end: Date | string | null },
  b: { start: Date | string; end: Date | string | null }
): boolean {
  const aStart = toDate(a.start).getTime();
  const aEnd = a.end ? toDate(a.end).getTime() : Infinity;
  const bStart = toDate(b.start).getTime();
  const bEnd = b.end ? toDate(b.end).getTime() : Infinity;

  return aStart < bEnd && bStart < aEnd;
}

export function validateShiftTimes(
  start: Date | string,
  end: Date | string | null
): string | null {
  if (end === null) return null;
  if (toDate(end).getTime() <= toDate(start).getTime()) {
    return "End time must be after start time.";
  }
  return null;
}

export function validateBreakWithinShift(
  brk: { startedAt: Date | string; endedAt: Date | string | null },
  shift: { start: Date | string; end: Date | string | null }
): string | null {
  const breakStart = toDate(brk.startedAt).getTime();
  const shiftStart = toDate(shift.start).getTime();

  if (breakStart < shiftStart) {
    return "Break cannot start before the shift starts.";
  }

  if (shift.end && brk.endedAt) {
    const breakEnd = toDate(brk.endedAt).getTime();
    const shiftEnd = toDate(shift.end).getTime();
    if (breakEnd > shiftEnd) {
      return "Break cannot end after the shift ends.";
    }
  }

  if (brk.endedAt && toDate(brk.endedAt).getTime() <= breakStart) {
    return "Break end time must be after break start time.";
  }

  return null;
}
