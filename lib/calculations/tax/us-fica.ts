import { dollarsToCents } from "../money";
import { calculateCappedFlatDeduction } from "./bracket-math";
import type { TaxLine } from "./types";

/**
 * 2024 FICA parameters (employee portion only). Verify against the SSA/IRS
 * published rates before relying on this.
 */
const SOCIAL_SECURITY_RATE = 0.062;
const SOCIAL_SECURITY_WAGE_BASE_CENTS = dollarsToCents(168_600);

const MEDICARE_RATE = 0.0145;
/** Additional Medicare tax on wages above this threshold (single filer). */
const ADDITIONAL_MEDICARE_RATE = 0.009;
const ADDITIONAL_MEDICARE_THRESHOLD_CENTS = dollarsToCents(200_000);

export function calculateFicaDeductions(grossAnnualIncomeCents: number): TaxLine[] {
  const socialSecurity = calculateCappedFlatDeduction(grossAnnualIncomeCents, SOCIAL_SECURITY_RATE, {
    ceilingCents: SOCIAL_SECURITY_WAGE_BASE_CENTS,
  });

  const medicare = calculateCappedFlatDeduction(grossAnnualIncomeCents, MEDICARE_RATE);

  const additionalMedicare = calculateCappedFlatDeduction(grossAnnualIncomeCents, ADDITIONAL_MEDICARE_RATE, {
    floorCents: ADDITIONAL_MEDICARE_THRESHOLD_CENTS,
  });

  const lines: TaxLine[] = [
    { label: "Social Security", amountCents: socialSecurity },
    { label: "Medicare", amountCents: medicare + additionalMedicare },
  ];
  return lines;
}
