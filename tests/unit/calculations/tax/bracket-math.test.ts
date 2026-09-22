import { describe, expect, it } from "vitest";
import { calculateCappedFlatDeduction, calculateMarginalTax } from "@/lib/calculations/tax/bracket-math";
import { dollarsToCents } from "@/lib/calculations/money";

describe("calculateMarginalTax", () => {
  const brackets = [
    { threshold: dollarsToCents(0), rate: 0.1 },
    { threshold: dollarsToCents(10_000), rate: 0.2 },
    { threshold: dollarsToCents(50_000), rate: 0.3 },
  ];

  it("taxes entirely within the first bracket", () => {
    expect(calculateMarginalTax(dollarsToCents(5_000), brackets)).toBe(dollarsToCents(500));
  });

  it("taxes across two brackets", () => {
    // $10,000 @ 10% + $5,000 @ 20% = $1,000 + $1,000 = $2,000
    expect(calculateMarginalTax(dollarsToCents(15_000), brackets)).toBe(dollarsToCents(2_000));
  });

  it("taxes across all three brackets", () => {
    // $10,000 @ 10% + $40,000 @ 20% + $10,000 @ 30% = 1,000 + 8,000 + 3,000 = 12,000
    expect(calculateMarginalTax(dollarsToCents(60_000), brackets)).toBe(dollarsToCents(12_000));
  });

  it("returns 0 for zero or negative income", () => {
    expect(calculateMarginalTax(0, brackets)).toBe(0);
    expect(calculateMarginalTax(-100, brackets)).toBe(0);
  });

  it("is unaffected by bracket order in the input array", () => {
    const shuffled = [brackets[2], brackets[0], brackets[1]];
    expect(calculateMarginalTax(dollarsToCents(60_000), shuffled)).toBe(dollarsToCents(12_000));
  });
});

describe("calculateCappedFlatDeduction", () => {
  it("applies the rate to the full amount when uncapped", () => {
    expect(calculateCappedFlatDeduction(dollarsToCents(1_000), 0.05)).toBe(dollarsToCents(50));
  });

  it("caps the taxable amount at the ceiling", () => {
    expect(
      calculateCappedFlatDeduction(dollarsToCents(100_000), 0.062, { ceilingCents: dollarsToCents(50_000) })
    ).toBe(Math.round(dollarsToCents(50_000) * 0.062));
  });

  it("excludes income below the floor (basic exemption)", () => {
    expect(
      calculateCappedFlatDeduction(dollarsToCents(10_000), 0.0595, {
        floorCents: dollarsToCents(3_500),
      })
    ).toBe(Math.round(dollarsToCents(6_500) * 0.0595));
  });

  it("returns 0 when income is entirely below the floor", () => {
    expect(
      calculateCappedFlatDeduction(dollarsToCents(2_000), 0.05, { floorCents: dollarsToCents(3_500) })
    ).toBe(0);
  });
});
