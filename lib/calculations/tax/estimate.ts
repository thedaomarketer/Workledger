import { calculateCappedFlatDeduction, calculateMarginalTax } from "./bracket-math";
import { CANADA_TAX_YEAR, FEDERAL_BASIC_PERSONAL_AMOUNT_CENTS, FEDERAL_BRACKETS as CA_FEDERAL_BRACKETS } from "./canada-federal";
import { calculateCanadianPayrollDeductions } from "./canada-payroll";
import { CANADA_PROVINCES } from "./canada-provinces";
import { calculateFicaDeductions } from "./us-fica";
import { US_FEDERAL_BRACKETS_SINGLE, US_STANDARD_DEDUCTION_SINGLE_CENTS, US_TAX_YEAR } from "./us-federal";
import { US_STATES } from "./us-states";
import { US_CITIES } from "./us-cities";
import type { JurisdictionSelection, TaxEstimateResult, TaxLine } from "./types";

function sumLines(lines: TaxLine[]): number {
  return lines.reduce((sum, line) => sum + line.amountCents, 0);
}

function finalize(
  taxYear: number,
  jurisdiction: JurisdictionSelection,
  grossAnnualIncomeCents: number,
  incomeTaxLines: TaxLine[],
  payrollDeductionLines: TaxLine[]
): TaxEstimateResult {
  const totalIncomeTaxCents = sumLines(incomeTaxLines);
  const totalPayrollDeductionsCents = sumLines(payrollDeductionLines);
  const totalDeductionsCents = totalIncomeTaxCents + totalPayrollDeductionsCents;

  return {
    taxYear,
    jurisdiction,
    grossAnnualIncomeCents,
    incomeTaxLines,
    payrollDeductionLines,
    totalIncomeTaxCents,
    totalPayrollDeductionsCents,
    totalDeductionsCents,
    netAnnualIncomeCents: grossAnnualIncomeCents - totalDeductionsCents,
    effectiveRate: grossAnnualIncomeCents > 0 ? totalDeductionsCents / grossAnnualIncomeCents : 0,
  };
}

function estimateCanadianTax(grossAnnualIncomeCents: number, provinceCode: string): TaxEstimateResult {
  const province = CANADA_PROVINCES[provinceCode];
  if (!province) throw new Error(`Unknown province code: ${provinceCode}`);

  const federalTaxable = Math.max(0, grossAnnualIncomeCents - FEDERAL_BASIC_PERSONAL_AMOUNT_CENTS);
  const provincialTaxable = Math.max(0, grossAnnualIncomeCents - province.basicPersonalAmountCents);

  const federalTax = calculateMarginalTax(federalTaxable, CA_FEDERAL_BRACKETS);
  const provincialTax = calculateMarginalTax(provincialTaxable, province.brackets);

  const incomeTaxLines: TaxLine[] = [
    { label: "Federal income tax", amountCents: federalTax },
    { label: `${province.name} income tax`, amountCents: provincialTax },
  ];

  return finalize(
    CANADA_TAX_YEAR,
    { country: "CA", region: provinceCode },
    grossAnnualIncomeCents,
    incomeTaxLines,
    calculateCanadianPayrollDeductions(grossAnnualIncomeCents)
  );
}

function estimateUsTax(
  grossAnnualIncomeCents: number,
  stateCode: string,
  cityCode?: string
): TaxEstimateResult {
  const state = US_STATES[stateCode];
  if (!state) throw new Error(`Unknown state code: ${stateCode}`);

  const federalTaxable = Math.max(0, grossAnnualIncomeCents - US_STANDARD_DEDUCTION_SINGLE_CENTS);
  const federalTax = calculateMarginalTax(federalTaxable, US_FEDERAL_BRACKETS_SINGLE);

  const incomeTaxLines: TaxLine[] = [{ label: "Federal income tax", amountCents: federalTax }];

  let stateTax = 0;
  if (state.rule.type === "flat") {
    stateTax = calculateCappedFlatDeduction(grossAnnualIncomeCents, state.rule.rate);
  } else if (state.rule.type === "brackets") {
    stateTax = calculateMarginalTax(grossAnnualIncomeCents, state.rule.brackets);
  }
  if (state.rule.type !== "none") {
    incomeTaxLines.push({ label: `${state.name} state income tax`, amountCents: stateTax });
  }

  if (cityCode) {
    const city = US_CITIES[cityCode];
    if (city) {
      const cityTax =
        city.rule.type === "flat"
          ? calculateCappedFlatDeduction(grossAnnualIncomeCents, city.rule.rate)
          : calculateMarginalTax(grossAnnualIncomeCents, city.rule.brackets);
      incomeTaxLines.push({ label: `${city.name} local tax`, amountCents: cityTax });
    }
  }

  return finalize(
    US_TAX_YEAR,
    { country: "US", region: stateCode, city: cityCode },
    grossAnnualIncomeCents,
    incomeTaxLines,
    calculateFicaDeductions(grossAnnualIncomeCents)
  );
}

/**
 * Estimates income tax + payroll deductions for a given annual gross
 * income and jurisdiction. Always a simplified, single-filer,
 * standard-deduction estimate -- see docs/tax.md for scope and caveats.
 */
export function estimateTax(
  grossAnnualIncomeCents: number,
  jurisdiction: JurisdictionSelection
): TaxEstimateResult {
  if (jurisdiction.country === "CA") {
    return estimateCanadianTax(grossAnnualIncomeCents, jurisdiction.region);
  }
  return estimateUsTax(grossAnnualIncomeCents, jurisdiction.region, jurisdiction.city);
}
