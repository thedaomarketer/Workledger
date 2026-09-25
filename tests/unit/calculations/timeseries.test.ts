import { describe, expect, it } from "vitest";
import { summarizeByWeek } from "@/lib/calculations/timeseries";
import { dollarsToCents } from "@/lib/calculations/money";

const TZ = "America/New_York";

const RATES = {
  "job-1": { hourlyRateCents: dollarsToCents(20), overtimeRateCents: null, overtimeThresholdMinutes: null },
};

describe("summarizeByWeek", () => {
  it("includes an all-zero week for a week with no shifts, rather than skipping it", () => {
    const shifts = [
      // Monday-start week of 2024-06-10.
      { jobId: "job-1", start: "2024-06-10T08:00:00-04:00", end: "2024-06-10T12:00:00-04:00", breaks: [] },
      // Week of 2024-06-17 has no shifts.
      // Week of 2024-06-24.
      { jobId: "job-1", start: "2024-06-24T08:00:00-04:00", end: "2024-06-24T14:00:00-04:00", breaks: [] },
    ];

    const weeks = summarizeByWeek(
      shifts,
      RATES,
      TZ,
      1,
      new Date("2024-06-10T00:00:00-04:00"),
      new Date("2024-06-28T00:00:00-04:00")
    );

    expect(weeks).toHaveLength(3);
    expect(weeks[0].paidMinutes).toBe(4 * 60);
    expect(weeks[1].paidMinutes).toBe(0);
    expect(weeks[1].earningsCents).toBe(0);
    expect(weeks[2].paidMinutes).toBe(6 * 60);
  });

  it("computes correct earnings per week", () => {
    const shifts = [
      { jobId: "job-1", start: "2024-06-10T08:00:00-04:00", end: "2024-06-10T13:00:00-04:00", breaks: [] }, // 5h
    ];

    const weeks = summarizeByWeek(
      shifts,
      RATES,
      TZ,
      1,
      new Date("2024-06-10T00:00:00-04:00"),
      new Date("2024-06-17T00:00:00-04:00")
    );

    expect(weeks).toHaveLength(1);
    expect(weeks[0].earningsCents).toBe(dollarsToCents(5 * 20));
  });

  it("produces consecutive, non-overlapping weeks across a DST transition", () => {
    // Range spans the 2024-11-03 fall-back week (Sunday-start weeks).
    const weeks = summarizeByWeek(
      [],
      RATES,
      TZ,
      0,
      new Date("2024-10-27T00:00:00-04:00"),
      new Date("2024-11-17T00:00:00-05:00")
    );

    expect(weeks).toHaveLength(3);
    for (let i = 1; i < weeks.length; i++) {
      // Each week's start must equal the previous week's end -- no gap, no overlap.
      expect(weeks[i].weekStart.getTime()).toBe(weeks[i - 1].weekEnd.getTime());
    }
    // The fall-back week (Nov 3) is 7 days + 1 hour long.
    const dstWeek = weeks[1];
    const spanHours = (dstWeek.weekEnd.getTime() - dstWeek.weekStart.getTime()) / 3_600_000;
    expect(spanHours).toBe(7 * 24 + 1);
  });
});
