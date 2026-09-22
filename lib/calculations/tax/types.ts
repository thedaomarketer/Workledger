/**
 * Tax estimation types. Everything in lib/calculations/tax/ computes a
 * simplified, single-filer, standard-deduction estimate for informational
 * purposes only -- it is not tax advice and does not replace a pay stub,
 * a T4/W-2, or actual tax software. See docs/tax.md for scope and sources.
 */

/** A marginal tax bracket: `rate` applies to income above `threshold`. */
export interface TaxBracket {
  /** Annual income (in cents) above which this bracket's rate applies. */
  threshold: number;
  /** Marginal rate for income in this bracket, e.g. 0.205 for 20.5%. */
  rate: number;
}

export type CountryCode = "CA" | "US";

export interface CanadianProvinceCode {
  code:
    | "AB"
    | "BC"
    | "MB"
    | "NB"
    | "NL"
    | "NS"
    | "NT"
    | "NU"
    | "ON"
    | "PE"
    | "QC"
    | "SK"
    | "YT";
}

export interface JurisdictionSelection {
  country: CountryCode;
  /** Province code (CA) or 2-letter state code (US). */
  region: string;
  /** Optional local jurisdiction, currently only US cities with a local income tax. */
  city?: string;
}

export interface TaxLine {
  label: string;
  amountCents: number;
}

export interface TaxEstimateResult {
  taxYear: number;
  jurisdiction: JurisdictionSelection;
  grossAnnualIncomeCents: number;
  /** Income tax lines (federal, then region, then city if any). */
  incomeTaxLines: TaxLine[];
  /** Payroll-style deductions (CPP+EI for Canada, FICA for US). */
  payrollDeductionLines: TaxLine[];
  totalIncomeTaxCents: number;
  totalPayrollDeductionsCents: number;
  totalDeductionsCents: number;
  netAnnualIncomeCents: number;
  /** totalDeductionsCents / grossAnnualIncomeCents, as a fraction. */
  effectiveRate: number;
}
