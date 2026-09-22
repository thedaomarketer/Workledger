import { describe, expect, it } from "vitest";
import { resolvePeriod } from "@/lib/ai/period";

const TZ = "America/New_York";
// Wednesday, 2024-06-12, 15:00 EDT.
const NOW = new Date("2024-06-12T19:00:00.000Z");
const ctx = { timezone: TZ, weekStartsOn: 1, now: NOW };

describe("resolvePeriod", () => {
  it("resolves today to local midnight-to-midnight", () => {
    const { start, end } = resolvePeriod("today", ctx);
    expect(start.toISOString()).toBe("2024-06-12T04:00:00.000Z");
    expect(end.toISOString()).toBe("2024-06-13T04:00:00.000Z");
  });

  it("resolves yesterday to the previous local day", () => {
    const { start, end } = resolvePeriod("yesterday", ctx);
    expect(start.toISOString()).toBe("2024-06-11T04:00:00.000Z");
    expect(end.toISOString()).toBe("2024-06-12T04:00:00.000Z");
  });

  it("resolves this_week to the Monday-start workweek containing now", () => {
    const { start, end } = resolvePeriod("this_week", ctx);
    expect(start.toISOString()).toBe("2024-06-10T04:00:00.000Z"); // Monday
    expect(end.toISOString()).toBe("2024-06-17T04:00:00.000Z");
  });

  it("resolves last_week to the workweek immediately before this_week", () => {
    const { start, end } = resolvePeriod("last_week", ctx);
    expect(start.toISOString()).toBe("2024-06-03T04:00:00.000Z");
    expect(end.toISOString()).toBe("2024-06-10T04:00:00.000Z");
  });

  it("resolves this_month to the calendar month containing now", () => {
    const { start, end } = resolvePeriod("this_month", ctx);
    expect(start.toISOString()).toBe("2024-06-01T04:00:00.000Z");
    expect(end.toISOString()).toBe("2024-07-01T04:00:00.000Z");
  });

  it("resolves last_month to the previous calendar month", () => {
    const { start, end } = resolvePeriod("last_month", ctx);
    expect(start.toISOString()).toBe("2024-05-01T04:00:00.000Z");
    expect(end.toISOString()).toBe("2024-06-01T04:00:00.000Z");
  });

  it("resolves custom to the given inclusive day range", () => {
    const { start, end } = resolvePeriod("custom", ctx, {
      startDate: "2024-06-01",
      endDate: "2024-06-05",
    });
    expect(start.toISOString()).toBe("2024-06-01T04:00:00.000Z");
    expect(end.toISOString()).toBe("2024-06-06T04:00:00.000Z");
  });

  it("throws when custom is missing startDate/endDate", () => {
    expect(() => resolvePeriod("custom", ctx)).toThrow();
  });
});
