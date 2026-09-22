import type { TaxBracket } from "./types";

/**
 * Computes progressive marginal tax on `incomeCents` given brackets sorted
 * ascending by threshold. Each bracket's rate applies only to the slice of
 * income between its threshold and the next bracket's threshold (or
 * infinity, for the last bracket). All amounts in integer cents; result is
 * rounded to the nearest cent only at the end to avoid compounding
 * rounding error across brackets.
 */
export function calculateMarginalTax(incomeCents: number, brackets: TaxBracket[]): number {
  if (incomeCents <= 0 || brackets.length === 0) return 0;

  const sorted = [...brackets].sort((a, b) => a.threshold - b.threshold);

  let totalCents = 0;
  for (let i = 0; i < sorted.length; i++) {
    const { threshold, rate } = sorted[i];
    if (incomeCents <= threshold) break;

    const nextThreshold = i + 1 < sorted.length ? sorted[i + 1].threshold : Infinity;
    const sliceTop = Math.min(incomeCents, nextThreshold);
    const sliceCents = sliceTop - threshold;
    if (sliceCents <= 0) continue;

    totalCents += sliceCents * rate;
  }

  return Math.round(totalCents);
}

/**
 * A flat-rate deduction with a wage base cap (e.g. CPP, EI, Social
 * Security): `rate` applies to income between `flooCents` and `ceilingCents`
 * (ceiling omitted = uncapped).
 */
export function calculateCappedFlatDeduction(
  incomeCents: number,
  rate: number,
  options: { floorCents?: number; ceilingCents?: number } = {}
): number {
  const floorCents = options.floorCents ?? 0;
  const ceilingCents = options.ceilingCents ?? Infinity;

  const taxableCents = Math.max(0, Math.min(incomeCents, ceilingCents) - floorCents);
  if (taxableCents <= 0) return 0;

  return Math.round(taxableCents * rate);
}
