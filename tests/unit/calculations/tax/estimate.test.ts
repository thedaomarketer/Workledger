import { describe, expect, it } from "vitest";
import { estimateTax } from "@/lib/calculations/tax/estimate";
import { dollarsToCents } from "@/lib/calculations/money";

describe("estimateTax", () => {
  it("keeps net + total deductions equal to gross for a Canadian estimate", () => {
    const result = estimateTax(dollarsToCents(60_000), { country: "CA", region: "ON" });
    expect(result.netAnnualIncomeCents + result.totalDeductionsCents).toBe(result.grossAnnualIncomeCents);
    expect(result.totalDeductionsCents).toBe(result.totalIncomeTaxCents + result.totalPayrollDeductionsCents);
    expect(result.incomeTaxLines).toHaveLength(2); // federal + provincial
    expect(result.payrollDeductionLines.some((l) => l.label.includes("CPP"))).toBe(true);
    expect(result.payrollDeductionLines.some((l) => l.label.includes("EI"))).toBe(true);
  });

  it("keeps net + total deductions equal to gross for a US estimate", () => {
    const result = estimateTax(dollarsToCents(60_000), { country: "US", region: "CA" });
    expect(result.netAnnualIncomeCents + result.totalDeductionsCents).toBe(result.grossAnnualIncomeCents);
    expect(result.payrollDeductionLines.some((l) => l.label === "Social Security")).toBe(true);
    expect(result.payrollDeductionLines.some((l) => l.label === "Medicare")).toBe(true);
  });

  it("charges no state income tax in a no-income-tax state", () => {
    const result = estimateTax(dollarsToCents(80_000), { country: "US", region: "TX" });
    expect(result.incomeTaxLines).toHaveLength(1); // federal only
    expect(result.incomeTaxLines[0].label).toBe("Federal income tax");
  });

  it("adds a local tax line when a city is specified", () => {
    const withCity = estimateTax(dollarsToCents(80_000), { country: "US", region: "NY", city: "NYC" });
    const withoutCity = estimateTax(dollarsToCents(80_000), { country: "US", region: "NY" });
    expect(withCity.incomeTaxLines).toHaveLength(3); // federal + state + city
    expect(withoutCity.incomeTaxLines).toHaveLength(2);
    expect(withCity.totalIncomeTaxCents).toBeGreaterThan(withoutCity.totalIncomeTaxCents);
  });

  it("produces zero tax and zero payroll deductions for zero income", () => {
    const result = estimateTax(0, { country: "CA", region: "AB" });
    expect(result.totalDeductionsCents).toBe(0);
    expect(result.netAnnualIncomeCents).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it("produces a higher effective rate at a much higher income (progressivity sanity check)", () => {
    const low = estimateTax(dollarsToCents(30_000), { country: "CA", region: "ON" });
    const high = estimateTax(dollarsToCents(300_000), { country: "CA", region: "ON" });
    expect(high.effectiveRate).toBeGreaterThan(low.effectiveRate);
  });

  it("throws on an unknown province or state code", () => {
    expect(() => estimateTax(dollarsToCents(50_000), { country: "CA", region: "ZZ" })).toThrow();
    expect(() => estimateTax(dollarsToCents(50_000), { country: "US", region: "ZZ" })).toThrow();
  });
});
