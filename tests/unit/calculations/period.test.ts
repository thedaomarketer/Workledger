import { describe, expect, it } from "vitest";
import { getLocalDayBounds, getLocalMonthBounds } from "@/lib/calculations/period";

const TZ = "America/New_York";

describe("getLocalDayBounds", () => {
  it("returns local midnight to midnight", () => {
    const { start, end } = getLocalDayBounds("2024-06-10T15:00:00-04:00", TZ);
    expect(start.toISOString()).toBe("2024-06-10T04:00:00.000Z");
    expect(end.toISOString()).toBe("2024-06-11T04:00:00.000Z");
  });
});

describe("getLocalMonthBounds", () => {
  it("returns the first of the month through the first of the next month", () => {
    const { start, end } = getLocalMonthBounds("2024-06-10T15:00:00-04:00", TZ);
    expect(start.toISOString()).toBe("2024-06-01T04:00:00.000Z");
    expect(end.toISOString()).toBe("2024-07-01T04:00:00.000Z");
  });
});
