import { describe, expect, it } from "vitest";
import { getNextPayday, getPayPeriod, payPeriodsPerYear } from "@/lib/calculations/payday";

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

  it("clamps a month-end monthly anchor to the last day of a shorter month", () => {
    // Anchor Jan 31, 2024 (a leap year -- Feb has 29 days).
    const feb = getNextPayday("2024-01-31", "monthly", TZ, new Date("2024-02-01T12:00:00-05:00"));
    expect(feb.toISOString().slice(0, 10)).toBe("2024-02-29");
  });

  it("returns to the true anchor day once the target month is long enough again", () => {
    // After clamping to Feb 29, March has 31 days, so the payday should
    // land back on the 31st rather than drifting from the clamped date.
    const march = getNextPayday("2024-01-31", "monthly", TZ, new Date("2024-03-01T12:00:00-05:00"));
    expect(march.toISOString().slice(0, 10)).toBe("2024-03-31");
  });
});

describe("getPayPeriod", () => {
  it("starts a weekly period on the previous payday", () => {
    const period = getPayPeriod("2024-06-07", "weekly", TZ, new Date("2024-06-12T12:00:00-04:00"));
    expect(period.start.toISOString().slice(0, 10)).toBe("2024-06-07");
    expect(period.end.toISOString().slice(0, 10)).toBe("2024-06-14");
  });

  it("starts a biweekly period 14 days before the payday", () => {
    const period = getPayPeriod("2024-06-07", "biweekly", TZ, new Date("2024-06-15T12:00:00-04:00"));
    expect(period.start.toISOString().slice(0, 10)).toBe("2024-06-07");
    expect(period.end.toISOString().slice(0, 10)).toBe("2024-06-21");
  });

  it("starts a monthly period on the same day the previous month", () => {
    const period = getPayPeriod("2024-05-15", "monthly", TZ, new Date("2024-06-01T12:00:00-04:00"));
    expect(period.start.toISOString().slice(0, 10)).toBe("2024-05-15");
    expect(period.end.toISOString().slice(0, 10)).toBe("2024-06-15");
  });

  it("finds the correct previous monthly payday across a clamped month-end anchor", () => {
    // end = Feb 29 (clamped); the previous payday is Jan 31, not "Feb 29
    // minus one month" (which would land on Jan 29).
    const period = getPayPeriod("2024-01-31", "monthly", TZ, new Date("2024-02-15T12:00:00-05:00"));
    expect(period.start.toISOString().slice(0, 10)).toBe("2024-01-31");
    expect(period.end.toISOString().slice(0, 10)).toBe("2024-02-29");
  });

  it("finds the previous semi-monthly payday within the same month", () => {
    const period = getPayPeriod("2024-06-01", "semi_monthly", TZ, new Date("2024-06-20T12:00:00-04:00"));
    expect(period.start.toISOString().slice(0, 10)).toBe("2024-06-15");
    expect(period.end.toISOString().slice(0, 10)).toBe("2024-07-01");
  });

  it("finds the previous semi-monthly payday across a month boundary", () => {
    const period = getPayPeriod("2024-06-01", "semi_monthly", TZ, new Date("2024-06-05T12:00:00-04:00"));
    expect(period.start.toISOString().slice(0, 10)).toBe("2024-06-01");
    expect(period.end.toISOString().slice(0, 10)).toBe("2024-06-15");
  });

  it("returns an empty period when the anchor payday hasn't happened yet", () => {
    const period = getPayPeriod("2024-06-14", "weekly", TZ, new Date("2024-06-01T12:00:00-04:00"));
    expect(period.start.getTime()).toBe(period.end.getTime());
    expect(period.start.toISOString().slice(0, 10)).toBe("2024-06-14");
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
