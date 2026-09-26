import { describe, expect, it } from "vitest";
import {
  addDaysToDateString,
  addMonthsToMonthString,
  instantToLocalInputs,
  localDateString,
  localDateTimeToInstant,
  localDayStart,
  localMonthString,
  resolveLocalShiftRange,
} from "@/lib/calculations/local-time";

describe("localDateTimeToInstant", () => {
  it("interprets the wall-clock time in the user's zone, not the server's", () => {
    // 09:00 in Toronto (EDT, UTC-4) is 13:00 UTC -- not 09:00 UTC.
    expect(localDateTimeToInstant("2024-06-10", "09:00", "America/Toronto").toISOString()).toBe(
      "2024-06-10T13:00:00.000Z"
    );
    expect(localDateTimeToInstant("2024-06-10", "09:00", "Asia/Tokyo").toISOString()).toBe(
      "2024-06-10T00:00:00.000Z"
    );
  });

  it("rejects malformed input instead of producing an Invalid Date", () => {
    expect(() => localDateTimeToInstant("June 10", "09:00", "UTC")).toThrow(RangeError);
    expect(() => localDateTimeToInstant("2024-06-10", "9am", "UTC")).toThrow(RangeError);
  });
});

describe("resolveLocalShiftRange", () => {
  it("resolves a same-day shift", () => {
    const { start, end } = resolveLocalShiftRange(
      { date: "2024-06-10", startTime: "09:00", endTime: "17:00" },
      "America/Toronto"
    );
    expect((end.getTime() - start.getTime()) / 3_600_000).toBe(8);
    expect(start.toISOString()).toBe("2024-06-10T13:00:00.000Z");
  });

  it("rolls an overnight shift into the next calendar day", () => {
    const { start, end } = resolveLocalShiftRange(
      { date: "2024-06-10", startTime: "22:00", endTime: "06:00" },
      "America/Toronto"
    );
    expect((end.getTime() - start.getTime()) / 3_600_000).toBe(8);
    expect(localDateString(end, "America/Toronto")).toBe("2024-06-11");
  });

  it("measures an overnight shift across spring-forward as 7 real hours", () => {
    // 2024-03-10 02:00 local jumps to 03:00 in America/New_York.
    const { start, end } = resolveLocalShiftRange(
      { date: "2024-03-09", startTime: "22:00", endTime: "06:00" },
      "America/New_York"
    );
    expect((end.getTime() - start.getTime()) / 3_600_000).toBe(7);
  });

  it("honours an explicit end date", () => {
    const { start, end } = resolveLocalShiftRange(
      { date: "2024-06-10", startTime: "20:00", endTime: "20:00", endDate: "2024-06-11" },
      "UTC"
    );
    expect((end.getTime() - start.getTime()) / 3_600_000).toBe(24);
  });
});

describe("local date helpers", () => {
  it("returns the local calendar date, which can differ from the UTC date", () => {
    // 02:00 UTC on June 11 is still June 10 in Toronto.
    expect(localDateString("2024-06-11T02:00:00Z", "America/Toronto")).toBe("2024-06-10");
    expect(localDateString("2024-06-11T02:00:00Z", "UTC")).toBe("2024-06-11");
    expect(localMonthString("2024-07-01T02:00:00Z", "America/Toronto")).toBe("2024-06");
  });

  it("round-trips an instant to form inputs in the user's zone", () => {
    expect(instantToLocalInputs("2024-06-11T02:30:00Z", "America/Toronto")).toEqual({
      date: "2024-06-10",
      time: "22:30",
    });
  });

  it("finds local midnight", () => {
    expect(localDayStart("2024-06-10", "America/Toronto").toISOString()).toBe("2024-06-10T04:00:00.000Z");
  });

  it("does calendar arithmetic across month and year boundaries", () => {
    expect(addDaysToDateString("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDaysToDateString("2024-12-31", 1)).toBe("2025-01-01");
    expect(addMonthsToMonthString("2024-01", -1)).toBe("2023-12");
    expect(addMonthsToMonthString("2024-12", 1)).toBe("2025-01");
  });
});
