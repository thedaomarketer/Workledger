import { describe, expect, it } from "vitest";
import { summarizeShiftsByJob, sumJobSummaries } from "@/lib/calculations/summary";
import { dollarsToCents } from "@/lib/calculations/money";

describe("summarizeShiftsByJob", () => {
  it("aggregates multiple shifts for the same job and applies overtime once for the total", () => {
    const shifts = [
      { jobId: "job-1", start: "2024-06-10T08:00:00-04:00", end: "2024-06-10T18:00:00-04:00", breaks: [] }, // 10h
      { jobId: "job-1", start: "2024-06-11T08:00:00-04:00", end: "2024-06-11T18:00:00-04:00", breaks: [] }, // 10h
      { jobId: "job-1", start: "2024-06-12T08:00:00-04:00", end: "2024-06-12T18:00:00-04:00", breaks: [] }, // 10h
      { jobId: "job-1", start: "2024-06-13T08:00:00-04:00", end: "2024-06-13T18:00:00-04:00", breaks: [] }, // 10h
      { jobId: "job-1", start: "2024-06-14T08:00:00-04:00", end: "2024-06-14T18:00:00-04:00", breaks: [] }, // 10h -> 50h total
    ];

    const summaries = summarizeShiftsByJob(shifts, {
      "job-1": {
        hourlyRateCents: dollarsToCents(24),
        overtimeRateCents: null,
        overtimeThresholdMinutes: 44 * 60,
      },
    });

    expect(summaries["job-1"].paidMinutes).toBe(50 * 60);
    expect(summaries["job-1"].regularMinutes).toBe(44 * 60);
    expect(summaries["job-1"].overtimeMinutes).toBe(6 * 60);
    expect(summaries["job-1"].shiftCount).toBe(5);
  });

  it("excludes incomplete (still clocked-in) shifts from the total", () => {
    const shifts = [
      { jobId: "job-1", start: "2024-06-10T08:00:00-04:00", end: "2024-06-10T18:00:00-04:00", breaks: [] },
      { jobId: "job-1", start: "2024-06-11T08:00:00-04:00", end: null, breaks: [] },
    ];

    const summaries = summarizeShiftsByJob(shifts, {
      "job-1": { hourlyRateCents: dollarsToCents(20), overtimeRateCents: null, overtimeThresholdMinutes: null },
    });

    expect(summaries["job-1"].paidMinutes).toBe(10 * 60);
    expect(summaries["job-1"].shiftCount).toBe(1);
  });

  it("keeps separate jobs independent", () => {
    const shifts = [
      { jobId: "job-1", start: "2024-06-10T08:00:00-04:00", end: "2024-06-10T12:00:00-04:00", breaks: [] },
      { jobId: "job-2", start: "2024-06-10T14:00:00-04:00", end: "2024-06-10T18:00:00-04:00", breaks: [] },
    ];

    const summaries = summarizeShiftsByJob(shifts, {
      "job-1": { hourlyRateCents: dollarsToCents(20), overtimeRateCents: null, overtimeThresholdMinutes: null },
      "job-2": { hourlyRateCents: dollarsToCents(30), overtimeRateCents: null, overtimeThresholdMinutes: null },
    });

    const totals = sumJobSummaries(summaries);
    expect(totals.paidMinutes).toBe(8 * 60);
    expect(totals.earningsCents).toBe(dollarsToCents(4 * 20 + 4 * 30));
  });
});
