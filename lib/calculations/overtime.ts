import { earningsCentsForMinutes } from "./money";
import type { EarningsResult, JobRate, OvertimeRule, OvertimeSplit } from "./types";

/**
 * Splits a workweek's total paid minutes into regular and overtime minutes
 * according to a configurable, jurisdiction-agnostic threshold. Callers are
 * responsible for grouping shifts into the correct workweek (see
 * workweek.ts) before calling this.
 */
export function splitRegularAndOvertime(
  totalPaidMinutes: number,
  rule: OvertimeRule
): OvertimeSplit {
  if (!rule.enabled || totalPaidMinutes <= rule.thresholdMinutes) {
    return {
      regularMinutes: Math.max(0, totalPaidMinutes),
      overtimeMinutes: 0,
    };
  }

  return {
    regularMinutes: rule.thresholdMinutes,
    overtimeMinutes: totalPaidMinutes - rule.thresholdMinutes,
  };
}

export function calculateEarnings(
  totalPaidMinutes: number,
  rate: JobRate,
  rule: OvertimeRule
): EarningsResult {
  const { regularMinutes, overtimeMinutes } = splitRegularAndOvertime(
    totalPaidMinutes,
    rule
  );

  const overtimeRateCents = rate.overtimeRateCents ?? rate.hourlyRateCents;

  const regularEarningsCents = earningsCentsForMinutes(
    regularMinutes,
    rate.hourlyRateCents
  );
  const overtimeEarningsCents = earningsCentsForMinutes(
    overtimeMinutes,
    overtimeRateCents
  );

  return {
    regularMinutes,
    overtimeMinutes,
    regularEarningsCents,
    overtimeEarningsCents,
    totalEarningsCents: regularEarningsCents + overtimeEarningsCents,
  };
}
