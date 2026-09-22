import { dollarsToCents } from "../money";
import type { TaxBracket } from "./types";

/** 2024 tax year, single filer. Verify against the IRS's published rates before relying on this for a real filing. */
export const US_TAX_YEAR = 2024;

export const US_STANDARD_DEDUCTION_SINGLE_CENTS = dollarsToCents(14_600);

export const US_FEDERAL_BRACKETS_SINGLE: TaxBracket[] = [
  { threshold: dollarsToCents(0), rate: 0.1 },
  { threshold: dollarsToCents(11_600), rate: 0.12 },
  { threshold: dollarsToCents(47_150), rate: 0.22 },
  { threshold: dollarsToCents(100_525), rate: 0.24 },
  { threshold: dollarsToCents(191_950), rate: 0.32 },
  { threshold: dollarsToCents(243_725), rate: 0.35 },
  { threshold: dollarsToCents(609_350), rate: 0.37 },
];
