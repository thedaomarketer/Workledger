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

  it("rejects malformed custom dates", () => {
    expect(() => resolvePeriod("custom", ctx, { startDate: "June 1", endDate: "2024-06-05" })).toThrow();
  });

  it("anchors custom ranges to local midnight far from UTC, across a DST change", () => {
    const kiritimati = { ...ctx, timezone: "Pacific/Kiritimati" }; // UTC+14
    const { start, end } = resolvePeriod("custom", kiritimati, { startDate: "2024-06-01", endDate: "2024-06-01" });
    expect(start.toISOString()).toBe("2024-05-31T10:00:00.000Z");
    expect(end.toISOString()).toBe("2024-06-01T10:00:00.000Z");

    // US spring-forward (Mar 10, 2024): the day is 23 hours long.
    const dst = resolvePeriod("custom", ctx, { startDate: "2024-03-10", endDate: "2024-03-10" });
    expect(dst.end.getTime() - dst.start.getTime()).toBe(23 * 60 * 60 * 1000);
  });
});
