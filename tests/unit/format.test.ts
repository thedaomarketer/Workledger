import { describe, expect, it } from "vitest";

import { daysUntil, formatCalendarDate, formatDate, formatDaysAway, formatMinutesAsHours, formatTime } from "@/lib/format";
import { MESSAGES } from "@/lib/i18n/messages";

const NBSP = " ";

describe("formatMinutesAsHours", () => {
  it("uses compact units in English", () => {
    expect(formatMinutesAsHours(222, "en")).toBe("3h 42m");
    expect(formatMinutesAsHours(45, "en")).toBe("45m");
    expect(formatMinutesAsHours(120, "en")).toBe("2h");
    expect(formatMinutesAsHours(0, "en")).toBe("0m");
  });

  it("uses spaced h / min in French and Spanish", () => {
    expect(formatMinutesAsHours(222, "fr")).toBe(`3${NBSP}h 42${NBSP}min`);
    expect(formatMinutesAsHours(45, "es")).toBe(`45${NBSP}min`);
    expect(formatMinutesAsHours(120, "fr")).toBe(`2${NBSP}h`);
  });
});

describe("formatCalendarDate", () => {
  it("formats the literal date, never shifting it through a time zone", () => {
    expect(formatCalendarDate("2024-03-01", "en-US")).toBe("Mar 1, 2024");
    // A date-only string parsed as UTC would show Feb 29 in the Americas.
    expect(formatCalendarDate("2024-03-01", "fr-CA")).toMatch(/^1\s?er? mars 2024$|^1 mars 2024$/);
    expect(formatCalendarDate("2024-12-31", "es-US")).toContain("31");
  });
});

describe("instant formatters", () => {
  const instant = "2024-06-11T02:30:00Z"; // Jun 10, 10:30 PM in Toronto

  it("render in the user's time zone, not the server's", () => {
    expect(formatDate(instant, "America/Toronto", "en-US")).toBe("Mon, Jun 10");
    expect(formatDate(instant, "Europe/Paris", "en-US")).toBe("Tue, Jun 11");
    expect(formatTime(instant, "America/Toronto", "en-US")).toBe("10:30 PM");
  });

  it("render in the user's language", () => {
    expect(formatTime(instant, "America/Toronto", "fr-CA")).toMatch(/^22\sh\s30$/);
    expect(formatDate(instant, "America/Toronto", "es-US").toLowerCase()).toContain("jun");
  });
});

describe("formatDaysAway", () => {
  it("says today, tomorrow, or in N days", () => {
    expect(formatDaysAway(0, MESSAGES.en)).toBe("Today");
    expect(formatDaysAway(-1, MESSAGES.en)).toBe("Today");
    expect(formatDaysAway(1, MESSAGES.fr)).toBe("Demain");
    expect(formatDaysAway(5, MESSAGES.es)).toBe("En 5 días");
  });

  it("pairs with daysUntil, rounding partial days up", () => {
    const now = new Date("2024-06-10T12:00:00Z");
    expect(daysUntil(new Date("2024-06-11T00:00:00Z"), now)).toBe(1);
    expect(daysUntil(new Date("2024-06-13T12:00:00Z"), now)).toBe(3);
  });
});
