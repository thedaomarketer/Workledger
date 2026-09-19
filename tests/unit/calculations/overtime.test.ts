import { describe, expect, it } from "vitest";
import { splitRegularAndOvertime, calculateEarnings } from "@/lib/calculations/overtime";
import { dollarsToCents } from "@/lib/calculations/money";

describe("splitRegularAndOvertime", () => {
  const rule = { enabled: true, thresholdMinutes: 44 * 60 };

  it("keeps everything regular when under the threshold", () => {
    const result = splitRegularAndOvertime(40 * 60, rule);
    expect(result).toEqual({ regularMinutes: 40 * 60, overtimeMinutes: 0 });
  });

  it("splits at the threshold", () => {
    const result = splitRegularAndOvertime(50 * 60, rule);
    expect(result).toEqual({ regularMinutes: 44 * 60, overtimeMinutes: 6 * 60 });
  });

  it("ignores the threshold entirely when overtime is disabled", () => {
    const result = splitRegularAndOvertime(60 * 60, { enabled: false, thresholdMinutes: 40 * 60 });
    expect(result).toEqual({ regularMinutes: 60 * 60, overtimeMinutes: 0 });
  });
});

describe("calculateEarnings", () => {
  it("calculates a Maple Restaurant style example: $24/hr, OT after 44h/week", () => {
    const rule = { enabled: true, thresholdMinutes: 44 * 60 };
    const rate = { hourlyRateCents: dollarsToCents(24), overtimeRateCents: null };

    // 50 hours paid this week.
    const result = calculateEarnings(50 * 60, rate, rule);

    expect(result.regularMinutes).toBe(44 * 60);
    expect(result.overtimeMinutes).toBe(6 * 60);
    expect(result.regularEarningsCents).toBe(dollarsToCents(44 * 24));
    // No explicit OT rate configured -> falls back to 1x the regular rate.
    expect(result.overtimeEarningsCents).toBe(dollarsToCents(6 * 24));
    expect(result.totalEarningsCents).toBe(dollarsToCents(44 * 24 + 6 * 24));
  });

  it("uses an explicit overtime rate when provided", () => {
    const rule = { enabled: true, thresholdMinutes: 40 * 60 };
    const rate = { hourlyRateCents: dollarsToCents(20), overtimeRateCents: dollarsToCents(30) };

    const result = calculateEarnings(45 * 60, rate, rule);

    expect(result.regularEarningsCents).toBe(dollarsToCents(40 * 20));
    expect(result.overtimeEarningsCents).toBe(dollarsToCents(5 * 30));
  });

  it("avoids floating point drift over many fractional-hour shifts", () => {
    const rule = { enabled: false, thresholdMinutes: 0 };
    const rate = { hourlyRateCents: dollarsToCents(19.37), overtimeRateCents: null };

    // 7 minutes, repeated 100 times, should be an exact integer cents value.
    let totalCents = 0;
    for (let i = 0; i < 100; i++) {
      totalCents += calculateEarnings(7, rate, rule).totalEarningsCents;
    }

    expect(Number.isInteger(totalCents)).toBe(true);
  });
});
