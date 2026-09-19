import { describe, expect, it } from "vitest";
import { getWorkweekBounds, groupByWorkweek } from "@/lib/calculations/workweek";

const TZ = "America/New_York";

describe("getWorkweekBounds", () => {
  it("starts a Monday workweek at local midnight Monday", () => {
    // 2024-06-12 is a Wednesday.
    const { start, end } = getWorkweekBounds("2024-06-12T15:00:00-04:00", TZ, 1);

    // Monday 2024-06-10 00:00 EDT == 2024-06-10T04:00:00Z
    expect(start.toISOString()).toBe("2024-06-10T04:00:00.000Z");
    // Following Monday.
    expect(end.toISOString()).toBe("2024-06-17T04:00:00.000Z");
  });

  it("starts a Sunday workweek at local midnight Sunday", () => {
    const { start } = getWorkweekBounds("2024-06-12T15:00:00-04:00", TZ, 0);
    // Sunday 2024-06-09 00:00 EDT
    expect(start.toISOString()).toBe("2024-06-09T04:00:00.000Z");
  });

  it("produces a workweek boundary that correctly spans a DST transition", () => {
    // Week of Sunday 2024-11-03 (fall back happens this week in America/New_York).
    const { start, end } = getWorkweekBounds("2024-11-04T12:00:00-05:00", TZ, 0);

    expect(start.toISOString()).toBe("2024-11-03T04:00:00.000Z"); // still EDT (-04:00)
    expect(end.toISOString()).toBe("2024-11-10T05:00:00.000Z"); // now EST (-05:00)

    // The workweek should therefore span 7 days plus the extra "fall back" hour.
    const spanHours = (end.getTime() - start.getTime()) / 3_600_000;
    expect(spanHours).toBe(7 * 24 + 1);
  });
});

describe("groupByWorkweek", () => {
  it("groups shifts that fall in the same Monday-start workweek together", () => {
    const shifts = [
      { id: "a", start: "2024-06-10T08:00:00-04:00" }, // Monday
      { id: "b", start: "2024-06-14T08:00:00-04:00" }, // Friday, same week
      { id: "c", start: "2024-06-17T08:00:00-04:00" }, // next Monday
    ];

    const buckets = groupByWorkweek(shifts, TZ, 1);

    expect(buckets.size).toBe(2);
    const firstBucket = [...buckets.values()][0];
    expect(firstBucket.map((s) => s.id)).toEqual(["a", "b"]);
  });
});
