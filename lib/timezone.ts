/**
 * IANA time zone helpers. A time zone string reaches date-fns-tz and Intl on
 * every page render, where an invalid one throws a RangeError -- so anything
 * user-supplied goes through `isValidTimeZone` (server-side) first.
 */

export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** Falls back to UTC for a missing or invalid zone rather than crashing a page. */
export function safeTimeZone(value: string | null | undefined): string {
  return isValidTimeZone(value) ? value : "UTC";
}

/**
 * Current IANA names for zones that ICU (and so Chrome/Node) still reports by
 * a retired alias -- people search for "Kolkata" and "Kyiv", not "Calcutta"
 * and "Kiev". Every target here is also accepted by Postgres
 * (`is_valid_time_zone`), so the modern name is what gets stored.
 */
const MODERN_ZONE_IDS: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "Asia/Rangoon": "Asia/Yangon",
  "Europe/Kiev": "Europe/Kyiv",
  "America/Godthab": "America/Nuuk",
  "Atlantic/Faeroe": "Atlantic/Faroe",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
  "America/Catamarca": "America/Argentina/Catamarca",
  "America/Cordoba": "America/Argentina/Cordoba",
  "America/Jujuy": "America/Argentina/Jujuy",
  "America/Mendoza": "America/Argentina/Mendoza",
  "America/Indianapolis": "America/Indiana/Indianapolis",
  "America/Louisville": "America/Kentucky/Louisville",
  "Pacific/Enderbury": "Pacific/Kanton",
  "Pacific/Truk": "Pacific/Chuuk",
  "Pacific/Ponape": "Pacific/Pohnpei",
};

/** The current IANA name for `timeZone` if it's a retired alias this runtime still understands. */
export function modernTimeZoneId(timeZone: string): string {
  const modern = MODERN_ZONE_IDS[timeZone];
  return modern && isValidTimeZone(modern) ? modern : timeZone;
}

/** Every IANA zone this runtime knows (by current name), plus UTC (which `supportedValuesOf` can omit). */
export function listTimeZones(): string[] {
  const zones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  const modern = [...new Set(zones.map(modernTimeZoneId))].sort();
  return modern.includes("UTC") ? modern : ["UTC", ...modern];
}

/** The zone's UTC offset at `at`, as "UTC", "UTC+5:30", or "UTC−4". */
export function formatUtcOffset(timeZone: string, at: Date = new Date()): string {
  const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value;

  const match = part?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return "UTC";

  const [, sign, hours, minutes] = match;
  if (hours === "00" && minutes === "00") return "UTC";
  const h = String(Number(hours));
  return `UTC${sign === "-" ? "−" : "+"}${minutes === "00" ? h : `${h}:${minutes}`}`;
}

/** "America/Argentina/Buenos_Aires" -> "Buenos Aires"; "UTC" -> "UTC". */
export function timeZoneCity(timeZone: string): string {
  const last = timeZone.split("/").pop() ?? timeZone;
  return last.replace(/_/g, " ");
}

/** "Toronto (UTC−4)" -- a compact label for hints next to time inputs. */
export function timeZoneLabel(timeZone: string, at: Date = new Date()): string {
  const offset = formatUtcOffset(timeZone, at);
  return timeZone === "UTC" ? offset : `${timeZoneCity(timeZone)} (${offset})`;
}
