import { dollarsToCents } from "../money";
import type { TaxBracket } from "./types";

/**
 * 2024 provincial/territorial income tax brackets and basic personal
 * amounts. These are approximate and were not sourced from a live feed --
 * verify against each province's published rates (or the CRA's combined
 * rate tables) before relying on this for anything beyond a rough estimate.
 * Provincial surtaxes (e.g. Ontario, PEI) and the Quebec federal abatement
 * are not modeled.
 */
export interface ProvinceTaxInfo {
  name: string;
  basicPersonalAmountCents: number;
  brackets: TaxBracket[];
}

export const CANADA_PROVINCES: Record<string, ProvinceTaxInfo> = {
  AB: {
    name: "Alberta",
    basicPersonalAmountCents: dollarsToCents(21_885),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.1 },
      { threshold: dollarsToCents(148_269), rate: 0.12 },
      { threshold: dollarsToCents(177_922), rate: 0.13 },
      { threshold: dollarsToCents(237_230), rate: 0.14 },
      { threshold: dollarsToCents(355_845), rate: 0.15 },
    ],
  },
  BC: {
    name: "British Columbia",
    basicPersonalAmountCents: dollarsToCents(12_580),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.0506 },
      { threshold: dollarsToCents(47_937), rate: 0.077 },
      { threshold: dollarsToCents(95_875), rate: 0.105 },
      { threshold: dollarsToCents(110_076), rate: 0.1229 },
      { threshold: dollarsToCents(133_664), rate: 0.147 },
      { threshold: dollarsToCents(181_232), rate: 0.168 },
      { threshold: dollarsToCents(252_752), rate: 0.205 },
    ],
  },
  MB: {
    name: "Manitoba",
    basicPersonalAmountCents: dollarsToCents(15_780),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.108 },
      { threshold: dollarsToCents(47_000), rate: 0.1275 },
      { threshold: dollarsToCents(100_000), rate: 0.174 },
    ],
  },
  NB: {
    name: "New Brunswick",
    basicPersonalAmountCents: dollarsToCents(13_044),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.094 },
      { threshold: dollarsToCents(49_958), rate: 0.14 },
      { threshold: dollarsToCents(99_916), rate: 0.16 },
      { threshold: dollarsToCents(185_064), rate: 0.195 },
    ],
  },
  NL: {
    name: "Newfoundland and Labrador",
    basicPersonalAmountCents: dollarsToCents(10_818),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.087 },
      { threshold: dollarsToCents(43_198), rate: 0.145 },
      { threshold: dollarsToCents(86_395), rate: 0.158 },
      { threshold: dollarsToCents(154_244), rate: 0.178 },
      { threshold: dollarsToCents(275_870), rate: 0.198 },
      { threshold: dollarsToCents(551_739), rate: 0.208 },
      { threshold: dollarsToCents(1_103_478), rate: 0.213 },
    ],
  },
  NS: {
    name: "Nova Scotia",
    basicPersonalAmountCents: dollarsToCents(8_481),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.0879 },
      { threshold: dollarsToCents(29_590), rate: 0.1495 },
      { threshold: dollarsToCents(59_180), rate: 0.1667 },
      { threshold: dollarsToCents(93_000), rate: 0.175 },
      { threshold: dollarsToCents(150_000), rate: 0.21 },
    ],
  },
  NT: {
    name: "Northwest Territories",
    basicPersonalAmountCents: dollarsToCents(16_593),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.059 },
      { threshold: dollarsToCents(50_597), rate: 0.086 },
      { threshold: dollarsToCents(101_198), rate: 0.122 },
      { threshold: dollarsToCents(164_525), rate: 0.1405 },
    ],
  },
  NU: {
    name: "Nunavut",
    basicPersonalAmountCents: dollarsToCents(18_767),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.04 },
      { threshold: dollarsToCents(53_268), rate: 0.07 },
      { threshold: dollarsToCents(106_537), rate: 0.09 },
      { threshold: dollarsToCents(173_205), rate: 0.115 },
    ],
  },
  ON: {
    name: "Ontario",
    basicPersonalAmountCents: dollarsToCents(12_399),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.0505 },
      { threshold: dollarsToCents(51_446), rate: 0.0915 },
      { threshold: dollarsToCents(102_894), rate: 0.1116 },
      { threshold: dollarsToCents(150_000), rate: 0.1216 },
      { threshold: dollarsToCents(220_000), rate: 0.1316 },
    ],
  },
  PE: {
    name: "Prince Edward Island",
    basicPersonalAmountCents: dollarsToCents(13_500),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.0965 },
      { threshold: dollarsToCents(32_656), rate: 0.1363 },
      { threshold: dollarsToCents(64_313), rate: 0.1665 },
    ],
  },
  QC: {
    name: "Quebec",
    basicPersonalAmountCents: dollarsToCents(18_056),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.14 },
      { threshold: dollarsToCents(51_780), rate: 0.19 },
      { threshold: dollarsToCents(103_545), rate: 0.24 },
      { threshold: dollarsToCents(126_000), rate: 0.2575 },
    ],
  },
  SK: {
    name: "Saskatchewan",
    basicPersonalAmountCents: dollarsToCents(18_491),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.105 },
      { threshold: dollarsToCents(52_057), rate: 0.125 },
      { threshold: dollarsToCents(148_734), rate: 0.145 },
    ],
  },
  YT: {
    name: "Yukon",
    basicPersonalAmountCents: dollarsToCents(15_705),
    brackets: [
      { threshold: dollarsToCents(0), rate: 0.064 },
      { threshold: dollarsToCents(55_867), rate: 0.09 },
      { threshold: dollarsToCents(111_733), rate: 0.109 },
      { threshold: dollarsToCents(173_205), rate: 0.128 },
      { threshold: dollarsToCents(500_000), rate: 0.15 },
    ],
  },
};

export const CANADA_PROVINCE_OPTIONS = Object.entries(CANADA_PROVINCES).map(([code, info]) => ({
  code,
  name: info.name,
}));
