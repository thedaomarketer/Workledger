import { describe, expect, it } from "vitest";
import { niceAxisMax } from "@/lib/charts/scale";

describe("niceAxisMax", () => {
  it("rounds up to a clean step above the raw max", () => {
    expect(niceAxisMax(37)).toEqual({ max: 40, step: 10 });
    expect(niceAxisMax(83)).toEqual({ max: 100, step: 20 });
  });

  it("lands exactly on the max when it's already a multiple of a clean step", () => {
    expect(niceAxisMax(40)).toEqual({ max: 40, step: 10 });
  });

  it("handles small values without collapsing to zero", () => {
    expect(niceAxisMax(3)).toEqual({ max: 3, step: 1 });
  });

  it("falls back to a default scale for zero or negative input", () => {
    expect(niceAxisMax(0)).toEqual({ max: 4, step: 1 });
    expect(niceAxisMax(-5)).toEqual({ max: 4, step: 1 });
  });

  it("always returns a max that's an exact multiple of step, so a fixed tick count never falls short of it", () => {
    // A regression case: 112,000 with tickCount 4 used to produce a max
    // whose tick count (max/step) didn't equal tickCount + 1, so a chart
    // that assumed exactly tickCount+1 ticks stopped short of `max` and let
    // a bar overshoot the topmost gridline.
    for (const raw of [37, 83, 112_000, 999, 12.5]) {
      const { max, step } = niceAxisMax(raw);
      expect(max % step).toBeCloseTo(0, 6);
      expect(max).toBeGreaterThanOrEqual(raw);
    }
  });
});
