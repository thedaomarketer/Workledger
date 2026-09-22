import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getCompletedShiftsInRange } from "./shifts";
import {
  dollarsToCents,
  getNextPayday,
  getPayPeriod,
  payPeriodsPerYear,
  summarizeShiftsByJob,
  sumJobSummaries,
  type PayFrequency,
} from "@/lib/calculations";

const INCOME_SAMPLE_WEEKS = 8;

export interface AnnualIncomeEstimate {
  /** Estimated annual gross income, derived from recent recorded shifts. */
  annualEstimateCents: number;
  /** Total earned across the sample window, before annualizing. */
  sampleEarningsCents: number;
  sampleWeeks: number;
  hasData: boolean;
}

/**
 * Estimates annual gross income by averaging earnings from recorded shifts
 * over the last `INCOME_SAMPLE_WEEKS` weeks and extrapolating to a year.
 * This is a starting point for the tax estimate, not a payroll figure --
 * the tax page lets the user override it.
 */
export async function getAnnualIncomeEstimate(userId: string): Promise<AnnualIncomeEstimate> {
  const supabase = await createClient();

  const end = new Date();
  const start = new Date(end.getTime() - INCOME_SAMPLE_WEEKS * 7 * 86_400_000);

  const [shifts, { data: jobs }] = await Promise.all([
    getCompletedShiftsInRange(userId, start, end),
    supabase.from("jobs").select("id, hourly_rate, overtime_rate, overtime_threshold_minutes").eq("user_id", userId),
  ]);

  const jobRates = Object.fromEntries(
    (jobs ?? []).map((job) => [
      job.id,
      {
        hourlyRateCents: job.hourly_rate ? dollarsToCents(job.hourly_rate) : 0,
        overtimeRateCents: job.overtime_rate ? dollarsToCents(job.overtime_rate) : null,
        overtimeThresholdMinutes: job.overtime_threshold_minutes,
      },
    ])
  );

  const shiftInputs = shifts
    .filter((s) => s.actual_start)
    .map((s) => ({
      jobId: s.job_id,
      start: s.actual_start!,
      end: s.actual_end,
      breaks: s.breaks.map((b) => ({ startedAt: b.started_at, endedAt: b.ended_at, isPaid: b.is_paid })),
    }));

  const { earningsCents } = sumJobSummaries(summarizeShiftsByJob(shiftInputs, jobRates));

  return {
    annualEstimateCents: Math.round((earningsCents / INCOME_SAMPLE_WEEKS) * 52),
    sampleEarningsCents: earningsCents,
    sampleWeeks: INCOME_SAMPLE_WEEKS,
    hasData: earningsCents > 0,
  };
}

export interface JobPayday {
  jobId: string;
  jobName: string;
  color: string;
  frequency: PayFrequency;
  nextPayday: Date;
}

/** Next projected payday for every active job with a pay schedule configured. */
export async function getUpcomingPaydays(userId: string, timezone: string): Promise<JobPayday[]> {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, name, color, pay_frequency, pay_anchor_date")
    .eq("user_id", userId)
    .eq("is_active", true)
    .not("pay_frequency", "is", null)
    .not("pay_anchor_date", "is", null);

  const paydays = (jobs ?? [])
    .filter((job) => job.pay_frequency && job.pay_anchor_date)
    .map((job) => ({
      jobId: job.id,
      jobName: job.name,
      color: job.color,
      frequency: job.pay_frequency as PayFrequency,
      nextPayday: getNextPayday(job.pay_anchor_date!, job.pay_frequency as PayFrequency, timezone),
    }));

  return paydays.sort((a, b) => a.nextPayday.getTime() - b.nextPayday.getTime());
}

export interface PayPeriodStatement {
  jobId: string;
  jobName: string;
  color: string;
  frequency: PayFrequency;
  periodsPerYear: number;
  periodStart: Date;
  periodEnd: Date;
  payDate: Date;
  paidMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  grossEarningsCents: number;
}

/**
 * A pay-stub-style statement for the current pay period of every active job
 * with a pay schedule configured -- hours and gross pay are always the
 * recorded/calculated figures from lib/calculations, never fabricated.
 */
export async function getPayPeriodStatements(userId: string, timezone: string): Promise<PayPeriodStatement[]> {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, name, color, hourly_rate, overtime_rate, overtime_threshold_minutes, pay_frequency, pay_anchor_date")
    .eq("user_id", userId)
    .eq("is_active", true)
    .not("pay_frequency", "is", null)
    .not("pay_anchor_date", "is", null);

  const scheduledJobs = (jobs ?? []).filter((job) => job.pay_frequency && job.pay_anchor_date);

  const statements = await Promise.all(
    scheduledJobs.map(async (job) => {
      const frequency = job.pay_frequency as PayFrequency;
      const { start, end } = getPayPeriod(job.pay_anchor_date!, frequency, timezone);

      const shifts = start.getTime() === end.getTime() ? [] : await getCompletedShiftsInRange(userId, start, end);
      const shiftInputs = shifts
        .filter((s) => s.job_id === job.id && s.actual_start)
        .map((s) => ({
          jobId: s.job_id,
          start: s.actual_start!,
          end: s.actual_end,
          breaks: s.breaks.map((b) => ({ startedAt: b.started_at, endedAt: b.ended_at, isPaid: b.is_paid })),
        }));

      const jobRates = {
        [job.id]: {
          hourlyRateCents: job.hourly_rate ? dollarsToCents(job.hourly_rate) : 0,
          overtimeRateCents: job.overtime_rate ? dollarsToCents(job.overtime_rate) : null,
          overtimeThresholdMinutes: job.overtime_threshold_minutes,
        },
      };
      const summary = summarizeShiftsByJob(shiftInputs, jobRates)[job.id] ?? {
        paidMinutes: 0,
        regularMinutes: 0,
        overtimeMinutes: 0,
        earningsCents: 0,
        shiftCount: 0,
      };

      return {
        jobId: job.id,
        jobName: job.name,
        color: job.color,
        frequency,
        periodsPerYear: payPeriodsPerYear(frequency),
        periodStart: start,
        periodEnd: end,
        payDate: end,
        paidMinutes: summary.paidMinutes,
        regularMinutes: summary.regularMinutes,
        overtimeMinutes: summary.overtimeMinutes,
        grossEarningsCents: summary.earningsCents,
      };
    })
  );

  return statements.sort((a, b) => a.payDate.getTime() - b.payDate.getTime());
}
