import { dollarsToCents } from "../money";
import type { TaxBracket } from "./types";

/**
 * 2024 tax year, single filer, approximate state income tax rules. These
 * were not sourced from a live feed -- verify against each state's
 * department of revenue before relying on this for anything beyond a rough
 * estimate. To keep the dataset a manageable size, brackets are applied
 * directly to gross income (state-specific standard deductions/exemptions
 * are not modeled, unlike the federal calculation).
 */
export type StateTaxRule =
  | { type: "none" }
  | { type: "flat"; rate: number }
  | { type: "brackets"; brackets: TaxBracket[] };

function flat(rate: number): StateTaxRule {
  return { type: "flat", rate };
}

function none(): StateTaxRule {
  return { type: "none" };
}

function brackets(pairs: [number, number][]): StateTaxRule {
  return {
    type: "brackets",
    brackets: pairs.map(([thresholdDollars, rate]) => ({
      threshold: dollarsToCents(thresholdDollars),
      rate,
    })),
  };
}

export const US_STATES: Record<string, { name: string; rule: StateTaxRule }> = {
  AL: { name: "Alabama", rule: brackets([[0, 0.02], [500, 0.04], [3_000, 0.05]]) },
  AK: { name: "Alaska", rule: none() },
  AZ: { name: "Arizona", rule: flat(0.025) },
  AR: { name: "Arkansas", rule: brackets([[0, 0.02], [5_100, 0.04], [10_300, 0.044]]) },
  CA: {
    name: "California",
    rule: brackets([
      [0, 0.01],
      [10_756, 0.02],
      [25_499, 0.04],
      [40_245, 0.06],
      [55_866, 0.08],
      [70_606, 0.093],
      [360_659, 0.103],
      [432_787, 0.113],
      [721_314, 0.123],
    ]),
  },
  CO: { name: "Colorado", rule: flat(0.044) },
  CT: {
    name: "Connecticut",
    rule: brackets([
      [0, 0.03],
      [10_000, 0.05],
      [50_000, 0.055],
      [100_000, 0.06],
      [200_000, 0.065],
      [250_000, 0.069],
      [500_000, 0.0699],
    ]),
  },
  DE: {
    name: "Delaware",
    rule: brackets([
      [0, 0.022],
      [5_000, 0.039],
      [10_000, 0.048],
      [20_000, 0.052],
      [25_000, 0.0555],
      [60_000, 0.066],
    ]),
  },
  DC: {
    name: "District of Columbia",
    rule: brackets([[0, 0.04], [10_000, 0.06], [40_000, 0.065], [60_000, 0.085], [250_000, 0.0925], [500_000, 0.0975], [1_000_000, 0.1075]]),
  },
  FL: { name: "Florida", rule: none() },
  GA: { name: "Georgia", rule: flat(0.0539) },
  HI: {
    name: "Hawaii",
    rule: brackets([
      [0, 0.014],
      [9_600, 0.032],
      [19_200, 0.055],
      [28_800, 0.064],
      [38_400, 0.068],
      [48_000, 0.072],
      [72_000, 0.076],
      [96_000, 0.079],
      [120_000, 0.0825],
    ]),
  },
  ID: { name: "Idaho", rule: flat(0.058) },
  IL: { name: "Illinois", rule: flat(0.0495) },
  IN: { name: "Indiana", rule: flat(0.0305) },
  IA: { name: "Iowa", rule: brackets([[0, 0.044], [6_000, 0.0482], [30_000, 0.057]]) },
  KS: { name: "Kansas", rule: brackets([[0, 0.031], [23_000, 0.0525], [46_000, 0.057]]) },
  KY: { name: "Kentucky", rule: flat(0.04) },
  LA: { name: "Louisiana", rule: brackets([[0, 0.0185], [12_500, 0.035], [50_000, 0.0425]]) },
  ME: { name: "Maine", rule: brackets([[0, 0.058], [26_050, 0.0675], [61_600, 0.0715]]) },
  MD: {
    name: "Maryland",
    rule: brackets([
      [0, 0.02],
      [1_000, 0.03],
      [2_000, 0.04],
      [3_000, 0.0475],
      [100_000, 0.05],
      [125_000, 0.0525],
      [150_000, 0.055],
      [250_000, 0.0575],
    ]),
  },
  MA: { name: "Massachusetts", rule: flat(0.05) },
  MI: { name: "Michigan", rule: flat(0.0405) },
  MN: {
    name: "Minnesota",
    rule: brackets([[0, 0.0535], [31_690, 0.068], [104_090, 0.0785], [193_240, 0.0985]]),
  },
  MS: { name: "Mississippi", rule: flat(0.047) },
  MO: { name: "Missouri", rule: brackets([[0, 0.02], [1_273, 0.025], [2_546, 0.03], [3_819, 0.035], [5_092, 0.04], [6_365, 0.045], [7_638, 0.048]]) },
  MT: { name: "Montana", rule: brackets([[0, 0.047], [20_500, 0.059]]) },
  NE: { name: "Nebraska", rule: brackets([[0, 0.0246], [3_700, 0.0351], [22_170, 0.0501], [35_730, 0.0584]]) },
  NV: { name: "Nevada", rule: none() },
  NH: { name: "New Hampshire", rule: none() },
  NJ: {
    name: "New Jersey",
    rule: brackets([
      [0, 0.014],
      [20_000, 0.0175],
      [35_000, 0.035],
      [40_000, 0.05525],
      [75_000, 0.0637],
      [500_000, 0.0897],
      [1_000_000, 0.1075],
    ]),
  },
  NM: { name: "New Mexico", rule: brackets([[0, 0.017], [5_500, 0.032], [11_000, 0.047], [16_000, 0.049], [210_000, 0.059]]) },
  NY: {
    name: "New York",
    rule: brackets([
      [0, 0.04],
      [8_500, 0.045],
      [11_700, 0.0525],
      [13_900, 0.055],
      [80_650, 0.06],
      [215_400, 0.0685],
      [1_077_550, 0.0965],
    ]),
  },
  NC: { name: "North Carolina", rule: flat(0.045) },
  ND: { name: "North Dakota", rule: brackets([[0, 0], [44_725, 0.019], [225_975, 0.025]]) },
  OH: { name: "Ohio", rule: brackets([[0, 0], [26_050, 0.0275], [100_000, 0.035]]) },
  OK: { name: "Oklahoma", rule: brackets([[0, 0.0025], [1_000, 0.0075], [2_500, 0.0175], [3_750, 0.0275], [4_900, 0.0375], [7_200, 0.0475]]) },
  OR: { name: "Oregon", rule: brackets([[0, 0.0475], [4_300, 0.0675], [10_750, 0.0875], [125_000, 0.099]]) },
  PA: { name: "Pennsylvania", rule: flat(0.0307) },
  RI: { name: "Rhode Island", rule: brackets([[0, 0.0375], [77_450, 0.0475], [176_050, 0.0599]]) },
  SC: { name: "South Carolina", rule: brackets([[0, 0], [3_460, 0.03], [17_330, 0.062]]) },
  SD: { name: "South Dakota", rule: none() },
  TN: { name: "Tennessee", rule: none() },
  TX: { name: "Texas", rule: none() },
  UT: { name: "Utah", rule: flat(0.0465) },
  VT: { name: "Vermont", rule: brackets([[0, 0.0335], [45_400, 0.066], [110_050, 0.076], [229_550, 0.0875]]) },
  VA: { name: "Virginia", rule: brackets([[0, 0.02], [3_000, 0.03], [5_000, 0.05], [17_000, 0.0575]]) },
  WA: { name: "Washington", rule: none() },
  WV: { name: "West Virginia", rule: brackets([[0, 0.0222], [10_000, 0.0296], [25_000, 0.0333], [40_000, 0.0478], [60_000, 0.0512]]) },
  WI: { name: "Wisconsin", rule: brackets([[0, 0.035], [14_320, 0.044], [28_640, 0.053], [315_310, 0.0765]]) },
  WY: { name: "Wyoming", rule: none() },
};

export const US_STATE_OPTIONS = Object.entries(US_STATES).map(([code, info]) => ({
  code,
  name: info.name,
}));
