import { dollarsToCents } from "../money";
import type { TaxBracket } from "./types";

/**
 * A small, deliberately incomplete set of US cities/municipalities with
 * their own local income or wage tax on residents. Thousands of US
 * municipalities levy some form of local tax (especially in Ohio and
 * Pennsylvania) -- only the handful most commonly asked about are modeled
 * here. 2024 tax year, approximate; verify locally.
 */
export type CityTaxRule = { type: "flat"; rate: number } | { type: "brackets"; brackets: TaxBracket[] };

export const US_CITIES: Record<string, { name: string; state: string; rule: CityTaxRule }> = {
  NYC: {
    name: "New York City",
    state: "NY",
    rule: {
      type: "brackets",
      brackets: [
        { threshold: dollarsToCents(0), rate: 0.03078 },
        { threshold: dollarsToCents(12_000), rate: 0.03762 },
        { threshold: dollarsToCents(25_000), rate: 0.03819 },
        { threshold: dollarsToCents(50_000), rate: 0.03876 },
      ],
    },
  },
  PHILADELPHIA: {
    name: "Philadelphia",
    state: "PA",
    rule: { type: "flat", rate: 0.0375 },
  },
};

export const US_CITY_OPTIONS = Object.entries(US_CITIES).map(([code, info]) => ({
  code,
  name: info.name,
  state: info.state,
}));
