import { dollarsToCents } from "../money";
import { calculateCappedFlatDeduction } from "./bracket-math";
import type { TaxLine } from "./types";

/**
 * 2024 CPP and EI parameters (employee portion only). CPP2 is the
 * additional tier introduced in 2024 on earnings between the YMPE and
 * YAMPE. Verify against the CRA's published rates before relying on this.
 */
const CPP_RATE = 0.0595;
const CPP_BASIC_EXEMPTION_CENTS = dollarsToCents(3_500);
const CPP_YMPE_CENTS = dollarsToCents(68_500); // Year's Maximum Pensionable Earnings
const CPP2_RATE = 0.04;
const CPP_YAMPE_CENTS = dollarsToCents(73_200); // Year's Additional Maximum Pensionable Earnings

const EI_RATE = 0.0166;
const EI_MAX_INSURABLE_EARNINGS_CENTS = dollarsToCents(63_200);

export function calculateCanadianPayrollDeductions(grossAnnualIncomeCents: number): TaxLine[] {
  const cpp = calculateCappedFlatDeduction(grossAnnualIncomeCents, CPP_RATE, {
    floorCents: CPP_BASIC_EXEMPTION_CENTS,
    ceilingCents: CPP_YMPE_CENTS,
  });

  const cpp2 = calculateCappedFlatDeduction(grossAnnualIncomeCents, CPP2_RATE, {
    floorCents: CPP_YMPE_CENTS,
    ceilingCents: CPP_YAMPE_CENTS,
  });

  const ei = calculateCappedFlatDeduction(grossAnnualIncomeCents, EI_RATE, {
    ceilingCents: EI_MAX_INSURABLE_EARNINGS_CENTS,
  });

  const lines: TaxLine[] = [{ kind: "cpp", label: "CPP contributions", amountCents: cpp + cpp2 }];
  if (ei > 0) lines.push({ kind: "ei", label: "EI premiums", amountCents: ei });
  return lines;
}
