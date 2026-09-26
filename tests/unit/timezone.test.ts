import { describe, expect, it } from "vitest";
import { formatUtcOffset, isValidTimeZone, listTimeZones, modernTimeZoneId, safeTimeZone, timeZoneCity } from "@/lib/timezone";
import { fmt, matchAcceptLanguage } from "@/lib/i18n/config";

describe("isValidTimeZone / safeTimeZone", () => {
  it("accepts real IANA zones and UTC", () => {
    expect(isValidTimeZone("America/Toronto")).toBe(true);
    expect(isValidTimeZone("Asia/Kolkata")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
  });

  it("rejects garbage, empty, and non-string input", () => {
    expect(isValidTimeZone("Mars/Olympus_Mons")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
    expect(isValidTimeZone(42)).toBe(false);
    expect(isValidTimeZone(null)).toBe(false);
  });

  it("falls back to UTC instead of passing an invalid zone through", () => {
    expect(safeTimeZone("Not/A_Zone")).toBe("UTC");
    expect(safeTimeZone(null)).toBe("UTC");
    expect(safeTimeZone("Europe/Paris")).toBe("Europe/Paris");
  });
});

describe("listTimeZones", () => {
  it("includes UTC and common zones", () => {
    const zones = listTimeZones();
    expect(zones).toContain("UTC");
    expect(zones).toContain("America/Vancouver");
    expect(zones.length).toBeGreaterThan(300);
  });
});

describe("formatUtcOffset", () => {
  it("formats whole-hour, half-hour, and zero offsets", () => {
    const winter = new Date("2024-01-15T12:00:00Z");
    expect(formatUtcOffset("America/New_York", winter)).toBe("UTC−5");
    expect(formatUtcOffset("Asia/Kolkata", winter)).toBe("UTC+5:30");
    expect(formatUtcOffset("UTC", winter)).toBe("UTC");
  });

  it("reflects daylight saving time at the given instant", () => {
    expect(formatUtcOffset("America/New_York", new Date("2024-07-15T12:00:00Z"))).toBe("UTC−4");
  });
});

describe("timeZoneCity", () => {
  it("returns a readable city name", () => {
    expect(timeZoneCity("America/Argentina/Buenos_Aires")).toBe("Buenos Aires");
    expect(timeZoneCity("UTC")).toBe("UTC");
  });
});

describe("matchAcceptLanguage", () => {
  it("picks the highest-weighted supported language", () => {
    expect(matchAcceptLanguage("fr-CA,fr;q=0.9,en;q=0.8")).toBe("fr");
    expect(matchAcceptLanguage("de-DE,de;q=0.9,es;q=0.5,en;q=0.4")).toBe("es");
    expect(matchAcceptLanguage("en;q=0.2,fr;q=0.9")).toBe("fr");
  });

  it("defaults to English when nothing matches or the header is missing", () => {
    expect(matchAcceptLanguage("de-DE,ja;q=0.8")).toBe("en");
    expect(matchAcceptLanguage(null)).toBe("en");
  });
});

describe("fmt", () => {
  it("substitutes placeholders and leaves unknown ones intact", () => {
    expect(fmt("In {n} days", { n: 3 })).toBe("In 3 days");
    expect(fmt("Hi {name}, {missing}", { name: "Sam" })).toBe("Hi Sam, {missing}");
  });
});

describe("modern zone names", () => {
  it("maps retired ICU aliases to current IANA names", () => {
    expect(modernTimeZoneId("Asia/Calcutta")).toBe("Asia/Kolkata");
    expect(modernTimeZoneId("Europe/Kiev")).toBe("Europe/Kyiv");
    expect(modernTimeZoneId("America/Toronto")).toBe("America/Toronto");
  });

  it("lists zones by current name, deduplicated, with UTC", () => {
    const zones = listTimeZones();
    expect(zones).toContain("Asia/Kolkata");
    expect(zones).not.toContain("Asia/Calcutta");
    expect(zones).toContain("UTC");
    expect(new Set(zones).size).toBe(zones.length);
    expect(zones.every(isValidTimeZone)).toBe(true);
  });
});
