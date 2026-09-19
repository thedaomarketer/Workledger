export type DateLike = Date | string;

export interface BreakInterval {
  startedAt: DateLike;
  /** null means the break has not ended yet. */
  endedAt: DateLike | null;
  isPaid: boolean;
}

export interface ShiftInterval {
  start: DateLike;
  /** null means the shift has not been clocked out yet. */
  end: DateLike | null;
  breaks: BreakInterval[];
}

export interface ShiftCalculationResult {
  /** Whether the shift has both a start and an end. */
  isComplete: boolean;
  /** end - start, in whole minutes. 0 when incomplete. */
  grossMinutes: number;
  /** Sum of unpaid break minutes. */
  unpaidBreakMinutes: number;
  /** Sum of paid break minutes (informational only; does not reduce paid time). */
  paidBreakMinutes: number;
  /** grossMinutes - unpaidBreakMinutes, floored at 0. */
  paidMinutes: number;
}

export interface OvertimeRule {
  /** Minutes of paid time per workweek before overtime kicks in. */
  thresholdMinutes: number;
  /** Whether overtime calculation is enabled at all. */
  enabled: boolean;
}

export interface OvertimeSplit {
  regularMinutes: number;
  overtimeMinutes: number;
}

export interface JobRate {
  /** Regular hourly rate, in cents, to avoid floating point drift. */
  hourlyRateCents: number;
  /** Overtime hourly rate, in cents. Falls back to hourlyRateCents when absent. */
  overtimeRateCents: number | null;
}

export interface EarningsResult {
  regularMinutes: number;
  overtimeMinutes: number;
  regularEarningsCents: number;
  overtimeEarningsCents: number;
  totalEarningsCents: number;
}
