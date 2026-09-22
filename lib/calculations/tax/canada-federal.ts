import { dollarsToCents } from "../money";
import type { TaxBracket } from "./types";

/** 2024 tax year. Verify against the CRA's published rates before relying on this for a real filing. */
export const CANADA_TAX_YEAR = 2024;

/** 2024 federal basic personal amount (base, non-enhanced). */
export const FEDERAL_BASIC_PERSONAL_AMOUNT_CENTS = dollarsToCents(15705);

export const FEDERAL_BRACKETS: TaxBracket[] = [
  { threshold: dollarsToCents(0), rate: 0.15 },
  { threshold: dollarsToCents(55_867), rate: 0.205 },
  { threshold: dollarsToCents(111_733), rate: 0.26 },
  { threshold: dollarsToCents(173_205), rate: 0.29 },
  { threshold: dollarsToCents(246_752), rate: 0.33 },
];
