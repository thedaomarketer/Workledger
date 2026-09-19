import { describe, expect, it } from "vitest";
import {
  centsToDollars,
  dollarsToCents,
  earningsCentsForMinutes,
  formatCents,
} from "@/lib/calculations/money";

describe("money helpers", () => {
  it("round-trips dollars to cents", () => {
    expect(dollarsToCents(24)).toBe(2400);
    expect(dollarsToCents(19.99)).toBe(1999);
    expect(centsToDollars(2400)).toBe(24);
  });

  it("computes earnings for a partial hour without float drift", () => {
    // 90 minutes at $20/hr = $30.00 exactly.
    expect(earningsCentsForMinutes(90, dollarsToCents(20))).toBe(3000);
  });

  it("rounds fractional cents to the nearest cent", () => {
    // 7 minutes at $19.37/hr = 7 * 1937 / 60 = 225.98... -> rounds to 226 cents.
    expect(earningsCentsForMinutes(7, dollarsToCents(19.37))).toBe(226);
  });

  it("formats cents as currency", () => {
    expect(formatCents(104750)).toBe("$1,047.50");
  });
});
