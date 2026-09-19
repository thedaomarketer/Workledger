import { describe, expect, it } from "vitest";
import {
  calculateShiftDuration,
  shiftsOverlap,
  validateBreakWithinShift,
  validateShiftTimes,
} from "@/lib/calculations/duration";

describe("calculateShiftDuration", () => {
  it("handles a midnight-crossing shift (10 PM -> 6 AM)", () => {
    const result = calculateShiftDuration({
      start: "2024-06-10T22:00:00-04:00",
      end: "2024-06-11T06:00:00-04:00",
      breaks: [],
    });

    expect(result.isComplete).toBe(true);
    expect(result.grossMinutes).toBe(8 * 60);
    expect(result.paidMinutes).toBe(8 * 60);
  });

  it("handles a long shift (8 AM -> 11 PM)", () => {
    const result = calculateShiftDuration({
      start: "2024-06-10T08:00:00-04:00",
      end: "2024-06-10T23:00:00-04:00",
      breaks: [],
    });

    expect(result.grossMinutes).toBe(15 * 60);
    expect(result.paidMinutes).toBe(15 * 60);
  });

  it("sums multiple unpaid breaks (30m + 15m + 20m)", () => {
    const result = calculateShiftDuration({
      start: "2024-06-10T08:00:00-04:00",
      end: "2024-06-10T16:00:00-04:00",
      breaks: [
        { startedAt: "2024-06-10T10:00:00-04:00", endedAt: "2024-06-10T10:30:00-04:00", isPaid: false },
        { startedAt: "2024-06-10T12:00:00-04:00", endedAt: "2024-06-10T12:15:00-04:00", isPaid: false },
        { startedAt: "2024-06-10T14:00:00-04:00", endedAt: "2024-06-10T14:20:00-04:00", isPaid: false },
      ],
    });

    expect(result.grossMinutes).toBe(8 * 60);
    expect(result.unpaidBreakMinutes).toBe(65);
    expect(result.paidMinutes).toBe(8 * 60 - 65);
  });

  it("does not reduce paid time for a paid break", () => {
    const result = calculateShiftDuration({
      start: "2024-06-10T08:00:00-04:00",
      end: "2024-06-10T16:00:00-04:00",
      breaks: [
        { startedAt: "2024-06-10T12:00:00-04:00", endedAt: "2024-06-10T12:15:00-04:00", isPaid: true },
      ],
    });

    expect(result.grossMinutes).toBe(8 * 60);
    expect(result.paidBreakMinutes).toBe(15);
    expect(result.unpaidBreakMinutes).toBe(0);
    expect(result.paidMinutes).toBe(8 * 60);
  });

  it("reduces paid time for an unpaid break", () => {
    const result = calculateShiftDuration({
      start: "2024-06-10T08:00:00-04:00",
      end: "2024-06-10T16:00:00-04:00",
      breaks: [
        { startedAt: "2024-06-10T12:00:00-04:00", endedAt: "2024-06-10T12:30:00-04:00", isPaid: false },
      ],
    });

    expect(result.paidMinutes).toBe(8 * 60 - 30);
  });

  it("marks a shift with a missing clock-out as incomplete", () => {
    const result = calculateShiftDuration({
      start: "2024-06-10T08:00:00-04:00",
      end: null,
      breaks: [],
    });

    expect(result.isComplete).toBe(false);
    expect(result.grossMinutes).toBe(0);
    expect(result.paidMinutes).toBe(0);
  });

  it("clamps break time still open at clock-out to the shift end", () => {
    const result = calculateShiftDuration({
      start: "2024-06-10T08:00:00-04:00",
      end: "2024-06-10T16:00:00-04:00",
      breaks: [{ startedAt: "2024-06-10T15:50:00-04:00", endedAt: null, isPaid: false }],
    });

    // Break never explicitly ended; it is closed out at shift end (10 min).
    expect(result.unpaidBreakMinutes).toBe(10);
    expect(result.paidMinutes).toBe(8 * 60 - 10);
  });

  it("computes correct real elapsed time across a spring-forward DST transition", () => {
    // On 2024-03-10 in America/New_York, clocks jump from 2:00 AM to 3:00 AM.
    // A worker clocking in at 1:00 AM and out at 3:00 AM local time actually
    // worked only 1 real hour, not 2 nominal wall-clock hours.
    const result = calculateShiftDuration({
      start: "2024-03-10T01:00:00-05:00", // 1:00 AM EST (pre-transition offset)
      end: "2024-03-10T03:00:00-04:00", // 3:00 AM EDT (post-transition offset)
      breaks: [],
    });

    expect(result.grossMinutes).toBe(60);
  });

  it("computes correct real elapsed time across a fall-back DST transition", () => {
    // On 2024-11-03 in America/New_York, clocks fall back from 2:00 AM to
    // 1:00 AM, so 1:00 AM occurs twice. A worker clocking in at the first
    // 1:00 AM (EDT) and out at the second 2:00 AM (EST) worked 2 real hours,
    // even though the wall clock only advanced by "1 hour" of readings.
    const result = calculateShiftDuration({
      start: "2024-11-03T01:00:00-04:00", // first 1:00 AM, still EDT
      end: "2024-11-03T02:00:00-05:00", // 2:00 AM EST, after falling back
      breaks: [],
    });

    expect(result.grossMinutes).toBe(2 * 60);
  });
});

describe("shiftsOverlap", () => {
  it("detects overlapping shifts", () => {
    const a = { start: "2024-06-10T08:00:00-04:00", end: "2024-06-10T16:00:00-04:00" };
    const b = { start: "2024-06-10T15:00:00-04:00", end: "2024-06-10T20:00:00-04:00" };
    expect(shiftsOverlap(a, b)).toBe(true);
  });

  it("does not flag back-to-back shifts as overlapping", () => {
    const a = { start: "2024-06-10T08:00:00-04:00", end: "2024-06-10T16:00:00-04:00" };
    const b = { start: "2024-06-10T16:00:00-04:00", end: "2024-06-10T20:00:00-04:00" };
    expect(shiftsOverlap(a, b)).toBe(false);
  });

  it("treats an open (still-active) shift as overlapping anything after it starts", () => {
    const a = { start: "2024-06-10T08:00:00-04:00", end: null };
    const b = { start: "2024-06-10T20:00:00-04:00", end: "2024-06-10T22:00:00-04:00" };
    expect(shiftsOverlap(a, b)).toBe(true);
  });
});

describe("validateShiftTimes", () => {
  it("rejects an end time before the start time", () => {
    expect(
      validateShiftTimes("2024-06-10T16:00:00-04:00", "2024-06-10T08:00:00-04:00")
    ).toMatch(/after start/i);
  });

  it("allows a null end time (still clocked in)", () => {
    expect(validateShiftTimes("2024-06-10T08:00:00-04:00", null)).toBeNull();
  });
});

describe("validateBreakWithinShift", () => {
  const shift = { start: "2024-06-10T08:00:00-04:00", end: "2024-06-10T16:00:00-04:00" };

  it("rejects a break that exceeds the shift duration by starting before it", () => {
    const brk = { startedAt: "2024-06-10T07:00:00-04:00", endedAt: "2024-06-10T07:30:00-04:00" };
    expect(validateBreakWithinShift(brk, shift)).toMatch(/before the shift/i);
  });

  it("rejects a break ending after the shift ends", () => {
    const brk = { startedAt: "2024-06-10T15:30:00-04:00", endedAt: "2024-06-10T16:30:00-04:00" };
    expect(validateBreakWithinShift(brk, shift)).toMatch(/after the shift/i);
  });

  it("accepts a break fully inside the shift", () => {
    const brk = { startedAt: "2024-06-10T12:00:00-04:00", endedAt: "2024-06-10T12:30:00-04:00" };
    expect(validateBreakWithinShift(brk, shift)).toBeNull();
  });
});
