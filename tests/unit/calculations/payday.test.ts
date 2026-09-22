import { describe, expect, it } from "vitest";
import { getNextPayday, payPeriodsPerYear } from "@/lib/calculations/payday";

const TZ = "America/New_York";

describe("getNextPayday", () => {
  it("returns the anchor date itself when it is in the future", () => {
    const next = getNextPayday("2024-06-14", "weekly", TZ, new Date("2024-06-01T12:00:00-04:00"));
    expect(next.toISOString().slice(0, 10)).toBe("2024-06-14");
  });

  it("advances weekly pay by 7-day increments", () => {
    // Anchor: Friday 2024-06-07. "Now" is the following Wednesday.
    const next = getNextPayday("2024-06-07", "weekly", TZ, new Date("2024-06-12T12:00:00-04:00"));
    expect(next.toISOString().slice(0, 10)).toBe("2024-06-14");
  });

  it("lands exactly on a weekly payday when 'now' is that day", () => {
    const next = getNextPayday("2024-06-07", "weekly", TZ, new Date("2024-06-14T08:00:00-04:00"));
    expect(next.toISOString().slice(0, 10)).toBe("2024-06-14");
  });

  it("advances biweekly pay by 14-day increments", () => {
    const next = getNextPayday("2024-06-07", "biweekly", TZ, new Date("2024-06-15T12:00:00-04:00"));
    expect(next.toISOString().slice(0, 10)).toBe("2024-06-21");
  });

  it("advances monthly pay to the same day next month", () => {
    const next = getNextPayday("2024-05-15", "monthly", TZ, new Date("2024-06-01T12:00:00-04:00"));
    expect(next.toISOString().slice(0, 10)).toBe("2024-06-15");
  });

  it("handles a weekly payday correctly across a DST transition", () => {
    // Anchor Friday 2024-03-01; "now" is just after the 2024-03-10 spring-forward.
    const next = getNextPayday("2024-03-01", "weekly", TZ, new Date("2024-03-11T12:00:00-04:00"));
    expect(next.toISOString().slice(0, 10)).toBe("2024-03-15");
  });

  it("semi-monthly pays on the anchor day and ~15 days later each month", () => {
    const first = getNextPayday("2024-06-01", "semi_monthly", TZ, new Date("2024-06-02T12:00:00-04:00"));
    expect(first.toISOString().slice(0, 10)).toBe("2024-06-15");

    const second = getNextPayday("2024-06-01", "semi_monthly", TZ, new Date("2024-06-16T12:00:00-04:00"));
    expect(second.toISOString().slice(0, 10)).toBe("2024-07-01");
  });
});

describe("payPeriodsPerYear", () => {
  it("returns the expected count for each frequency", () => {
    expect(payPeriodsPerYear("weekly")).toBe(52);
    expect(payPeriodsPerYear("biweekly")).toBe(26);
    expect(payPeriodsPerYear("semi_monthly")).toBe(24);
    expect(payPeriodsPerYear("monthly")).toBe(12);
  });
});
